package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

var (
	version = "0.0.1"
)

func main() {
	var port = flag.Int("port", 8080, "http port")
	var dataDir = flag.String("data", "data/", "path to user data directory")
	var siteDir = flag.String("site", "site/", "path to static site directory")

	flag.Parse()

	// FIXME: pull in git version
	log.Printf("norns-web (%s)", version)
	log.Printf("  port: %d", *port)
	log.Printf("  site: %s", *siteDir)
	log.Printf("  data: %s", *dataDir)

	http.Handle("/", http.FileServer(http.Dir(*siteDir)))

	var apiRoot = "/api/v1/"
	http.Handle(apiRoot, http.StripPrefix(apiRoot, newAPIServer(*dataDir)))

	log.Println("listening...")
	err := http.ListenAndServe(fmt.Sprintf(":%d", *port), nil)
	if err != nil {
		log.Fatal(err)
	}
}

type apiServer struct {
	dataRoot string
}

func newAPIServer(dataRoot string) apiServer {
	return apiServer{dataRoot}
}

func (api apiServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL.Path)
	if r.URL.Path == "" {
		api.Index(w)
		return
	}

	http.NotFound(w, r)
}

func (api apiServer) Index(w http.ResponseWriter) {

}
