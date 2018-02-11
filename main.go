package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/url"
	"os"
	"path/filepath"

	"github.com/kataras/iris"
	"github.com/kataras/iris/middleware/logger"
	"github.com/kataras/iris/middleware/recover"
)

var (
	version = "0.0.1"
)

func main() {
	var port = flag.Int("port", 5000, "http port")
	var dataDir = flag.String("data", "data/", "path to user data directory")
	var siteDir = flag.String("site", "site/", "path to static site directory")
	var debug = flag.Bool("debug", false, "enable debug logging")

	flag.Parse()

	// FIXME: pull in git version
	log.Printf("norns-web (%s)", version)
	log.Printf("  port: %d", *port)
	log.Printf("  site: %s", *siteDir)
	log.Printf("  data: %s", *dataDir)

	app := iris.New()

	if *debug {
		app.Logger().SetLevel("debug")
	}
	// add two built'n handlers
	// that can recover from any http-relative panics
	// and log the requests to the terminal.
	app.Use(recover.New())
	app.Use(logger.New())

	// expose site
	app.StaticWeb("/", *siteDir)

	// api
	apiRoot := "/api/v1"
	resourcePath := makeResourcePath(apiRoot)
	api := app.Party(apiRoot)
	api.Get("/", func(ctx iris.Context) {
		ctx.JSON(apiInfo{"norns", version})
	})

	api.Get("/scripts", func(ctx iris.Context) {
		entries, err := ioutil.ReadDir(filepath.Join(*dataDir, "scripts"))
		if err != nil {
			ctx.Writef("%v", err)
			ctx.StatusCode(iris.StatusBadRequest)
			return
		}

		var scripts = []scriptInfo{}
		for _, entry := range entries {
			if !entry.IsDir() {
				scripts = append(scripts, scriptInfo{
					entry.Name(),
					resourcePath("scripts", entry.Name()),
				})
			}
		}

		ctx.JSON(scripts)
	})

	api.Get("/scripts/{name}", func(ctx iris.Context) {
		name := ctx.Params().Get("name")
		path := scriptPath(dataDir, &name)
		ctx.ContentType("text/utf-8") // FIXME: is this needed? is it bad?
		err := ctx.ServeFile(path, false)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
		}
	})

	api.Put("/scripts/{name}", func(ctx iris.Context) {
		name := ctx.Params().Get("name")
		path := scriptPath(dataDir, &name)
		script := ctx.PostValue("value")

		app.Logger().Debug("save path: ", path)
		app.Logger().Debug("content type: ", ctx.GetContentType())
		app.Logger().Debug("content: ", script)

		// open destination stream
		out, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0666)
		defer out.Close()

		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(errorInfo{err.Error()})
			return
		}

		size, err := io.WriteString(out, script)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(errorInfo{err.Error()})
			return
		}
		app.Logger().Debugf("wrote %d bytes to %s", size, path)
	})

	app.Run(iris.Addr(fmt.Sprintf(":%d", *port)))
}

func scriptPath(dataDir *string, name *string) string {
	return filepath.Join(*dataDir, "scripts", *name)
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

type scriptInfo struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

type errorInfo struct {
	Error string `json:"error"`
}
