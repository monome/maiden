package cmd

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/monome/maiden/pkg/catalog"
	"github.com/monome/maiden/pkg/lines"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var catalogUpdateCmd = &cobra.Command{
	Use:   "update",
	Short: "update configured catalogs",
	Run: func(cmd *cobra.Command, args []string) {
		ConfigureLogger()
		catalogUpdateRun(args)
	},
}

func init() {
	catalogCmd.AddCommand(catalogUpdateCmd)
}

// FIXME: merge this with pkg/dust/project.go:downloadURL
func downloadURLToFile(filepath string, url string) error {
	logger.Debug("downloading: ", url)
	resp, err := http.Get(url)
	if err != nil {
		logger.Debug("url get failed: ", err)
		return err
	}
	defer resp.Body.Close()

	logger.Debug("creating file: ", filepath)
	f, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer f.Close()

	n, err := io.Copy(f, resp.Body)
	logger.Debugf("wrote %d bytes, error = %s", n, err)
	return err
}

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

// FIXME: refactor this to remove duplicate logic
func catalogUpdateRun(args []string) {
	sources := viper.GetStringMap("sources")
	for key, v := range sources {
		source := v.(map[string]interface{})

		if len(args) > 0 && !contains(args, key) {
			logger.Debugf("source '%s' not in update list, skipping", key)
			continue
		}

		kind, ok := source["kind"]
		if !ok {
			logger.Warnf("source 'kind' not specified for '%s', skipping", key)
			continue
		}

		fmt.Printf("Updating: %s; ", key)
		switch kind {
		case "lines":
			rawpath, ok := source["output"]
			if !ok {
				logger.Warnf("missing 'output' value config for source: %s, skipping.", key)
				break
			}

			fmt.Printf("fetching topics from lines... ")
			catalog := catalog.New()
			err := lines.GatherProjects(catalog)
			if err != nil {
				log.Fatalf("failed while gathering project: %s", err)
			}

			path := os.ExpandEnv(rawpath.(string))
			logger.Debug("creating file: ", path)
			destination, err := os.Create(path)
			if err != nil {
				log.Fatalf("%s", err)
			}
			defer destination.Close()

			err = catalog.Store(destination)
			if err != nil {
				log.Fatal(err)
			}
			fmt.Printf("wrote: %s\n", path)

		case "download":
			rawpath, ok := source["output"]
			if !ok {
				logger.Warnf("missing 'output' value config for source: %s, skipping.", key)
				break
			}
			path := os.ExpandEnv(rawpath.(string))
			rawurl, ok := source["url"]
			if !ok {
				logger.Warnf("missing 'url' value config for source: %s, skipping.", key)
				break
			}
			url := rawurl.(string)
			fmt.Printf("fetching %s... ", url)
			if err := downloadURLToFile(path, url); err != nil {
				logger.Fatal(err)
			}
			fmt.Printf("wrote: %s\n", path)

		default:
			fmt.Println("unrecognized catalog source:", kind)
		}
	}
}
