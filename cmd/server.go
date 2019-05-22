package cmd

import (
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/coreos/go-systemd/dbus"
	"github.com/gin-gonic/gin"
	"github.com/monome/maiden/pkg/catalog"
	"github.com/monome/maiden/pkg/dust"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	httpPort int
	httpFD   int

	dataDir string
	appDir  string
	docDir  string
)

var serverCmd = &cobra.Command{
	Use:   "server",
	Short: "run the backend server for maiden",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		ConfigureLogger()
		LoadConfiguration()
		serverRun()
	},
}

func init() {
	serverCmd.Flags().IntVar(&httpPort, "port", 5000, "HTTP `port`")
	serverCmd.Flags().IntVar(&httpFD, "fd", 0, "file `descriptor` on which to serve HTTP (overrides -port)")

	serverCmd.Flags().StringVar(&dataDir, "data", "data/", "`path` to user data directory (dust)")
	serverCmd.Flags().StringVar(&appDir, "app", "app/", "`path` to maiden web app directory")
	serverCmd.Flags().StringVar(&docDir, "doc", "doc/", "`path` to matron lua docs")

	// allow config file values to be overriden by command line
	viper.BindPFlag("dust.path", serverCmd.Flags().Lookup("data"))
	viper.BindPFlag("web.path", serverCmd.Flags().Lookup("app"))
	viper.BindPFlag("doc.path", serverCmd.Flags().Lookup("doc"))

	serverCmd.Flags().SortFlags = false

	rootCmd.AddCommand(serverCmd)
}

func serverRun() {
	httpLocation := fmt.Sprintf("port %d", httpPort)
	if httpFD > 0 {
		httpLocation = fmt.Sprintf("fd %d", httpFD)
	}

	// (re)populate to ensure config file values are used
	appDir = os.ExpandEnv(viper.GetString("web.path"))
	dataDir = os.ExpandEnv(viper.GetString("dust.path"))
	docDir = os.ExpandEnv(viper.GetString("doc.path"))

	// FIXME: pull in git version
	logger.Infof("maiden (%s)", version)
	logger.Infof("  http: %s", httpLocation)
	logger.Infof("   app: %s", appDir)
	logger.Infof("  data: %s", dataDir)
	logger.Infof("   doc: %s", docDir)

	if debug {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.GET("", func(ctx *gin.Context) {
		ctx.Redirect(http.StatusFound, "/maiden")
	})

	// expose app
	r.Static("/maiden", appDir)

	// expose docs
	r.Static("/doc", docDir)

	// api
	apiRoot := "/api/v1"
	api := r.Group(apiRoot)

	api.GET("", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, apiInfo{"maiden", version})
	})

	// dust api
	apiPrefix := filepath.Join(apiRoot, "dust")

	// dbus connection for process management
	dbusConn, err := dbus.NewSystemConnection()
	if err != nil {
		logger.Warnf("dbus connection error: %v", err)
	}

	s := server{
		apiPrefix:    apiPrefix,
		apiPath:      makeResourcePath(apiRoot),
		devicePath:   makeDevicePath(dataDir),
		resourcePath: makeResourcePath(apiPrefix),
		dbusConn:     dbusConn,

		catalogs: make(map[string]*LoadedCatalog),
	}

	api.GET("/dust", s.rootListingHandler)
	api.GET("/dust/*name", s.listingHandler)
	api.PUT("/dust/*name", s.writeHandler)
	api.PATCH("/dust/*name", s.renameHandler)
	api.DELETE("/dust/*name", s.deleteHandler)

	api.GET("/unit/:name", s.unitHandler)

	api.GET("/catalogs", s.getCatalogsHandler)
	api.GET("/catalog/:name", s.getCatalogHandler)
	api.POST("/catalog/:name", s.createCatalogHandler)
	api.DELETE("/catalog/:name", s.deleteCatalogHandler)

	api.GET("/projects", s.getProjectsHandler)
	api.GET("/project/:name", s.getProjectHandler)
	api.DELETE("/project/:name", s.deleteProjectHandler)

	var l net.Listener
	if httpFD > 0 {
		l, err = net.FileListener(os.NewFile(uintptr(httpFD), "http"))
	} else {
		l, err = net.Listen("tcp", fmt.Sprintf(":%d", httpPort))
	}
	if err != nil {
		log.Fatalf("listen error: %v", err)
	}
	log.Fatal(http.Serve(l, r))

	if dbusConn != nil {
		dbusConn.Close()
	}
}

type server struct {
	apiPrefix    string
	apiPath      prefixFunc
	devicePath   devicePathFunc
	resourcePath prefixFunc

	// unit management
	dbusConn *dbus.Conn

	// catalog management
	catalogs      map[string]*LoadedCatalog
	catalogsMutex sync.Mutex
}

func (s *server) dustRoot() string {
	return s.devicePath("")
}

func (s *server) unitHandler(ctx *gin.Context) {
	if s.dbusConn == nil {
		ctx.JSON(http.StatusServiceUnavailable, gin.H{"error": "no dbus connection"})
		return
	}

	name := ctx.Param("name")
	operation, set := ctx.GetQuery("do")
	if set {
		var jobID int
		var err error
		ch := make(chan string)

		// perform operation (replacing any previously queued changes)
		if operation == "restart" {
			jobID, err = s.dbusConn.RestartUnit(name, "replace", ch)
		} else if operation == "stop" {
			jobID, err = s.dbusConn.StopUnit(name, "replace", ch)
		} else if operation == "start" {
			jobID, err = s.dbusConn.StartUnit(name, "replace", ch)
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "unrecognized operation"})
			return
		}

		// signal error if operation failed
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// package operation result
		result := <-ch
		ctx.JSON(http.StatusOK, gin.H{
			"job_id": jobID,
			"result": result,
		})

	} else {
		props, err := s.dbusConn.GetUnitProperties(name)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// package status result
		ctx.JSON(http.StatusOK, gin.H{
			"state":     props["ActiveState"],
			"sub_state": props["SubState"],
		})
	}
}

func (s *server) rootListingHandler(ctx *gin.Context) {
	entries, err := ioutil.ReadDir(s.dustRoot())
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dir := handleDirRead("", &entries, s.resourcePath)
	ctx.JSON(http.StatusOK, dir)
}

func (s *server) listingHandler(ctx *gin.Context) {
	name := ctx.Param("name")
	path := s.devicePath(name)

	logger.Debugf("get of name: %s", name)
	logger.Debugf("device path: %s", path)

	// figure out if this is a file or not
	info, err := os.Stat(path)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if info.IsDir() {
		entries, err := ioutil.ReadDir(path)
		if err != nil {
			// not sure why this would fail given that we just stat()'d the dir
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		prefix := filepath.Join(s.apiPrefix, name)
		subResourcePath := makeResourcePath(prefix)
		dir := handleDirRead(name, &entries, subResourcePath)
		ctx.JSON(http.StatusOK, dir)
		return
	}

	ctx.File(path)
}

func (s *server) writeHandler(ctx *gin.Context) {
	name := ctx.Param("name")
	path := s.devicePath(name)

	kind, exists := ctx.GetQuery("kind")
	if exists && kind == "directory" {

		err := os.MkdirAll(path, 0755)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("created directory %s", path)})

	} else {
		// get code (file) blob
		file, err := ctx.FormFile("value")
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		logger.Debugf("save path: %s", path)
		logger.Debugf("content type: %s", file.Header["Content-Type"])

		// size, err := io.Copy(out, file)
		if err := ctx.SaveUploadedFile(file, path); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("uploaded %s (%s, %d) to %s", file.Filename, file.Header, file.Size, path)})
	}
}

func (s *server) renameHandler(ctx *gin.Context) {
	// FIXME: this logic basically assumes PATCH == rename operation at the moment
	name := ctx.Param("name")
	path := s.devicePath(name)

	// figure out if this exists or not
	_, err := os.Stat(path)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// compute new path
	newName, exists := ctx.GetPostForm("name")
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing 'name' key in form"})
		return
	}
	rename := filepath.Join(filepath.Dir(name), newName)
	renamePath := s.devicePath(rename)

	logger.Debugf("going to rename: %s to: %s", path, renamePath)

	err = os.Rename(path, renamePath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	renameComponents := strings.Split(rename, string(os.PathSeparator))
	info := patchInfo{s.resourcePath(renameComponents...)}
	ctx.JSON(http.StatusOK, info)
}

func (s *server) deleteHandler(ctx *gin.Context) {
	name := ctx.Param("name")
	path := s.devicePath(name)

	logger.Debugf("going to delete: %s", path)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err := os.RemoveAll(path)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("deleted %s", path)})
}

type catalogSummary struct {
	Name string    `json:"name"`
	Date time.Time `json:"date"`
	URL  string    `json:"url"`
}

type catalogsInfo struct {
	Catalogs []catalogSummary `json:"catalogs"`
	Self     string           `json:"url"`
}

func (s *server) refreshCatalogs() {
	// FIXME: only load the catalogs if they have changed on disk
	s.catalogsMutex.Lock()
	defer s.catalogsMutex.Unlock()

	logger.Debug("refreshing catalogs...")

	for _, path := range GetCatalogPaths() {
		if existing := s.catalogs[path]; existing != nil {
			// already loaded; reload if it has changed
			fileInfo, err := os.Stat(path)
			if os.IsNotExist(err) {
				// ...glob found a match but it doesn't exist, it must have been quickly removed
				delete(s.catalogs, path)
				continue
			}
			if fileInfo.ModTime().Unix() > existing.FileInfo.ModTime().Unix() {
				fresh, err := LoadCatalogFile(path)
				if err != nil {
					logger.Warnf("failed reloading: %s", err)
					continue
				}
				s.catalogs[path] = fresh
			}
		} else {
			// new file, load it
			fresh, err := LoadCatalogFile(path)
			if err != nil {
				logger.Warnf("failed loading: %s", err)
				continue
			}
			s.catalogs[path] = fresh
		}
	}

	logger.Debug("finished refreshing catalogs...")
}

func (s *server) getCatalogsHandler(ctx *gin.Context) {
	// FIXME: this probably makes more sense to expose update logic on the
	// /catalog/:name handlers and the refreshCatalogs() function refactored.
	update, exists := ctx.GetQuery("update")
	if exists {
		if update == "all" {
			logger.Debug("updating all catalogs...")
			CatalogUpdateRun(nil)
		} else {
			logger.Debugf("updating catalog: %s", update)
			CatalogUpdateRun([]string{update})
		}
	}

	// (re)load anything which has changed
	s.refreshCatalogs()

	summary := make([]catalogSummary, 0)

	for _, value := range s.catalogs {
		name := value.Catalog.Name()
		summary = append(summary, catalogSummary{
			Name: name,
			Date: value.Catalog.Updated(),
			URL:  s.apiPath("catalog", name),
		})
	}

	ctx.JSON(http.StatusOK, catalogsInfo{
		Catalogs: summary,
		Self:     ctx.Request.URL.String(), // MAINT: this includes query args...
	})
}

type catalogContent struct {
	Name    string          `json:"name"`
	Updated time.Time       `json:"updated,omitempty"`
	Entries []catalog.Entry `json:"entries"`
	URL     string          `json:"url"`
}

func (s *server) getCatalogHandler(ctx *gin.Context) {
	s.refreshCatalogs()

	which := ctx.Param("name")
	for _, loaded := range s.catalogs {
		if loaded.Catalog.Name() == which {
			ctx.JSON(http.StatusOK, catalogContent{
				Name:    loaded.Catalog.Name(),
				Updated: loaded.Catalog.Updated(),
				Entries: loaded.Catalog.Entries(),
				URL:     ctx.Request.URL.String(),
			})
			return
		}
	}
	ctx.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("unknown catalog: %s", which)})
}

func (s *server) createCatalogHandler(ctx *gin.Context) {
}

func (s *server) deleteCatalogHandler(ctx *gin.Context) {
}

type projectSummary struct {
	Name    string `json:"name"`
	Managed bool   `json:"managed"`
	Version string `json:"version"`
	URL     string `json:"url"`
}

type projectsInfo struct {
	Projects []projectSummary `json:"projects"`
	Self     string           `json:"url"`
}

func (s *server) getProjectsHandler(ctx *gin.Context) {
	projects, err := dust.GetProjects(s.devicePath("code"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed loading projects: %s", err)})
		return
	}

	listing := make([]projectSummary, 0)
	for _, p := range projects {
		version := ""
		managed := p.IsManaged()
		if managed {
			version, _ = p.GetVersion()
		}
		listing = append(listing, projectSummary{
			Name:    p.Name,
			Managed: managed,
			Version: version,
			URL:     s.apiPath("project", p.Name),
		})
	}

	ctx.JSON(http.StatusOK, projectsInfo{
		Projects: listing,
		Self:     ctx.Request.URL.String(), // MAINT: this includes query args...
	})
}

func (s *server) getProjectHandler(ctx *gin.Context) {
	projectDir := s.devicePath("code")
	projects, err := dust.GetProjects(projectDir)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed loading projects: %s", err)})
		return
	}

	which := ctx.Param("name")
	p := dust.SearchProjects(projects, which)
	if p == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("unknown project: %s", which)})
		return
	}

	_, exists := ctx.GetQuery("update")
	if exists {
		// ignore the value for now but it could be a commit or version in the future?
		if p.IsManaged() {
			if err := p.Update(true); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": fmt.Sprintf("update failed: %s", err),
				})
				return
			}
		} else {
			// load catalog(s)
			catalogs := LoadCatalogs()
			if catalogs == nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": "unable to load script catalog(s)",
				})
				return
			}

			// assume zip
			if entry := SearchCatalogs(catalogs, p.Name); entry != nil {
				// TODO: only remove if download succeds?
				os.RemoveAll(p.Root)
				if err = dust.Install(projectDir, p.Name, entry.URL); err != nil {
					ctx.JSON(http.StatusInternalServerError, gin.H{
						"error": fmt.Sprintf("(re)install failed: %s", err),
					})
					return
				}
			} else {
				ctx.JSON(http.StatusNotFound, gin.H{"error": "cannot find in catalog"})
				return
			}
		}
	}

	// MAINT: this is redudant with the 'projects' handler but could be expanded to include more detail in the future
	version := ""
	managed := p.IsManaged()
	if managed {
		version, _ = p.GetVersion()
	}
	ctx.JSON(http.StatusOK, projectSummary{
		Name:    p.Name,
		Managed: managed,
		Version: version,
		URL:     s.apiPath("project", p.Name),
	})
}

func (s *server) deleteProjectHandler(ctx *gin.Context) {
	projects, err := dust.GetProjects(s.devicePath("code"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed loading projects: %s", err)})
		return
	}

	which := ctx.Param("name")
	p := dust.SearchProjects(projects, which)
	if p == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("unknown project: %s", which)})
		return
	}

	if err := os.RemoveAll(p.Root); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("removed %s", which)})
}

type devicePathFunc func(name string) string

func makeDevicePath(prefix string) devicePathFunc {
	return func(name string) string {
		return filepath.Join(prefix, name)
	}
}

type prefixFunc func(...string) string

func makeResourcePath(prefix string) prefixFunc {
	return func(parts ...string) string {
		var escaped = []string{}
		for _, part := range parts {
			escaped = append(escaped, url.PathEscape(part))
		}
		return filepath.Join(prefix, filepath.Join(escaped...))
	}
}

type apiInfo struct {
	API     string `json:"api"`
	Version string `json:"version"`
}

type fileInfo struct {
	Name     string      `json:"name"`
	URL      string      `json:"url"`
	Children *[]fileInfo `json:"children,omitempty"`
}

type dirInfo struct {
	Path    string     `json:"path"`
	URL     string     `json:"url"`
	Entries []fileInfo `json:"entries"`
}

type errorInfo struct {
	Error string `json:"error"`
}

type patchInfo struct {
	URL string `json:"url"`
}

func handleDirRead(path string, entries *[]os.FileInfo, resourcePath prefixFunc) *dirInfo {
	var files = []fileInfo{}
	for _, entry := range *entries {
		var children *[]fileInfo
		if entry.IsDir() {
			children = &[]fileInfo{}
		}
		if !strings.HasPrefix(entry.Name(), ".") {
			files = append(files, fileInfo{
				entry.Name(),
				resourcePath(entry.Name()),
				children,
			})
		}
	}
	return &dirInfo{
		path,
		resourcePath(""),
		files,
	}
}
