package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

var (
	version = "0.0.2"
)

const (
	ScriptDir = "lua"
	AudioDir  = "audio"
	DataDir   = "data"
	SCLangDir = "sc"
)

func main() {
	var port = flag.Int("port", 5000, "http port")
	var dataDir = flag.String("data", "data/", "path to user data directory")
	var appDir = flag.String("app", "app/", "path to maiden app directory")
	var docDir = flag.String("doc", "doc/", "path to matron lua docs")
	var debug = flag.Bool("debug", false, "enable debug logging")

	flag.Parse()

	// FIXME: pull in git version
	log.Printf("maiden (%s)", version)
	log.Printf("  port: %d", *port)
	log.Printf("   app: %s", *appDir)
	log.Printf("  data: %s", *dataDir)
	log.Printf("   doc: %s", *docDir)

	if *debug {
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
	r.Static("/maiden", *appDir)

	// expose docs
	r.Static("/doc", *docDir)

	// api
	apiRoot := "/api/v1"
	api := r.Group(apiRoot)

	api.GET("", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, apiInfo{"maiden", version})
	})

	logger := os.Stderr

	// scripts api
	apiPrefix := filepath.Join(apiRoot, "scripts")
	devicePath := makeDevicePath(filepath.Join(*dataDir, ScriptDir))
	api.GET("/scripts", rootListingHandler(logger, apiPrefix, devicePath))
	api.GET("/scripts/*name", listingHandler(logger, apiPrefix, devicePath))
	api.PUT("/scripts/*name", writeHandler(logger, apiPrefix, devicePath))
	api.PATCH("/scripts/*name", renameHandler(logger, apiPrefix, devicePath))
	api.DELETE("/scripts/*name", deleteHandler(logger, apiPrefix, devicePath))

	// data api
	apiPrefix = filepath.Join(apiRoot, "data")
	devicePath = makeDevicePath(filepath.Join(*dataDir, DataDir))
	api.GET("/data", rootListingHandler(logger, apiPrefix, devicePath))
	api.GET("/data/*name", listingHandler(logger, apiPrefix, devicePath))
	api.PUT("/data/*name", writeHandler(logger, apiPrefix, devicePath))
	api.PATCH("/data/*name", renameHandler(logger, apiPrefix, devicePath))
	api.DELETE("/data/*name", deleteHandler(logger, apiPrefix, devicePath))

	// audio api
	apiPrefix = filepath.Join(apiRoot, "audio")
	devicePath = makeDevicePath(filepath.Join(*dataDir, AudioDir))
	api.GET("/audio", rootListingHandler(logger, apiPrefix, devicePath))
	api.GET("/audio/*name", listingHandler(logger, apiPrefix, devicePath))
	api.PUT("/audio/*name", writeHandler(logger, apiPrefix, devicePath))
	api.PATCH("/audio/*name", renameHandler(logger, apiPrefix, devicePath))
	api.DELETE("/audio/*name", deleteHandler(logger, apiPrefix, devicePath))

	r.Run(fmt.Sprintf(":%d", *port))
}

func rootListingHandler(logger io.Writer, apiPrefix string, devicePath devicePathFunc) gin.HandlerFunc {
	resourcePath := makeResourcePath(apiPrefix)

	return func(ctx *gin.Context) {
		top := "" // MAINT: get rid of this
		entries, err := ioutil.ReadDir(devicePath(&top))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		dir := handleDirRead("", &entries, resourcePath)
		ctx.JSON(http.StatusOK, dir)
	}
}

func listingHandler(logger io.Writer, apiPrefix string, devicePath devicePathFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.Param("name")
		path := devicePath(&name)

		fmt.Fprintln(logger, "get of name: ", name)
		fmt.Fprintln(logger, "device path: ", path)

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

			prefix := filepath.Join(apiPrefix, name)
			subResourcePath := makeResourcePath(prefix)
			dir := handleDirRead(name, &entries, subResourcePath)
			ctx.JSON(http.StatusOK, dir)
			return
		}

		ctx.File(path)
	}
}

func writeHandler(logger io.Writer, apiPrefix string, devicePath devicePathFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.Param("name")
		path := devicePath(&name)

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

			fmt.Fprintf(logger, "save path: %s\n", path)
			fmt.Fprintf(logger, "content type: %s\n", file.Header["Content-Type"])

			// size, err := io.Copy(out, file)
			if err := ctx.SaveUploadedFile(file, path); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("uploaded %s (%s, %d) to %s", file.Filename, file.Header, file.Size, path)})
		}
	}
}

func renameHandler(logger io.Writer, apiPrefix string, devicePath devicePathFunc) gin.HandlerFunc {
	resourcePath := makeResourcePath(apiPrefix)

	return func(ctx *gin.Context) {
		// FIXME: this logic basically assumes PATCH == rename operation at the moment
		name := ctx.Param("name")
		path := devicePath(&name)

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
		renamePath := devicePath(&rename)

		fmt.Fprintf(logger, "going to rename: %s to: %s\n", path, renamePath)

		err = os.Rename(path, renamePath)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		info := patchInfo{resourcePath(rename)}
		ctx.JSON(http.StatusOK, info)
	}
}

func deleteHandler(logger io.Writer, apiPrefix string, devicePath devicePathFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.Param("name")
		path := devicePath(&name)

		fmt.Fprintln(logger, "going to delete: ", path)

		if _, err := os.Stat(path); os.IsNotExist(err) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		err := os.Remove(path)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("deleted %s", path)})
	}
}

type devicePathFunc func(name *string) string

func makeDevicePath(prefix string) devicePathFunc {
	return func(name *string) string {
		return filepath.Join(prefix, *name)
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
		files = append(files, fileInfo{
			entry.Name(),
			resourcePath(entry.Name()),
			children,
		})
	}
	return &dirInfo{
		path,
		files,
	}
}
