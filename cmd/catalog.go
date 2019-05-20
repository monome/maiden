package cmd

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"text/tabwriter"

	"github.com/monome/maiden/pkg/catalog"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var catalogCmd = &cobra.Command{
	Use:   "catalog",
	Short: "manage the script catalog",
	Args:  cobra.NoArgs,
}

var catalogListCmd = &cobra.Command{
	Use:   "list",
	Short: "list projects",
	Run: func(cmd *cobra.Command, args []string) {
		ConfigureLogger()
		catalogListRun(args)
	},
}

var catalogInitCmd = &cobra.Command{
	Use:   "init",
	Short: "init an empty catalog file",
	Args:  cobra.RangeArgs(1, 1),
	Run: func(cmd *cobra.Command, args []string) {
		ConfigureLogger()
		catalogInitRun(args)
	},
}

func init() {
	catalogCmd.AddCommand(catalogListCmd)
	catalogCmd.AddCommand(catalogInitCmd)
	rootCmd.AddCommand(catalogCmd)
}

func catalogListRun(args []string) {
	// FIXME: refactor this in terms of GetCatalogs after figuring out how to
	// retain the filename info

	catalogPatterns := viper.GetStringSlice("catalogs")
	logger.Debug("configured catalog locations: ", catalogPatterns)

	w := new(tabwriter.Writer)
	w.Init(os.Stdout, 0, 8, 0, '\t', 0) // FIXME: magic numbers?

	for _, pattern := range catalogPatterns {
		logger.Debug("loading catalog(s) matching: ", pattern)
		matches, err := filepath.Glob(os.ExpandEnv(pattern))
		if err != nil {
			logger.Warn("bad pattern ", err)
			continue
		}
		if len(matches) > 0 {
			for _, path := range matches {
				f, err := os.Open(path)
				if err != nil {
					logger.Warn(err)
					continue
				}
				catalog, err := catalog.Load(f)
				f.Close()
				if err != nil {
					// fmt.Printf("WARN: load error: %s (%s)\n", err,
					// path)
					logger.Warnf("failed to load catalog %s (%s), skipping.", err, path)
					continue
				}

				fmt.Fprintf(os.Stdout, "[ %s ]\n", path)
				fmt.Fprintln(w, "project\tsource\turl\ttags\t")
				fmt.Fprintln(w, "-------\t------\t---\t----\t")
				for _, entry := range catalog.Entries() {
					fmt.Fprintf(w, "%s\t%s\t%s\t%s\t\n", entry.ProjectName, entry.Origin, entry.URL, entry.Tags)
				}
				w.Flush()
			}
		} else {
			logger.Warn("no catalog files matched pattern: ", pattern)
		}
	}
}

func catalogInitRun(args []string) {
	c := catalog.New()
	logger.Debug("creating file: ", args[0])
	f, err := os.Create(args[0])
	if err != nil {
		log.Fatalln(err)
	}
	defer f.Close()
	c.Store(f)
	fmt.Printf("Wrote: %s\n", args[0])
}

// GetCatalogs loads all catalogs specified in the config
func GetCatalogs() []*catalog.Catalog {
	catalogs := make([]*catalog.Catalog, 0)

	catalogPatterns := viper.GetStringSlice("catalogs")
	for _, pattern := range catalogPatterns {
		matches, err := filepath.Glob(os.ExpandEnv(pattern))
		if err != nil {
			logger.Warn("bad pattern ", err)
			continue
		}
		for _, path := range matches {
			f, err := os.Open(path)
			if err != nil {
				logger.Warn(err)
				continue
			}
			catalog, err := catalog.Load(f)
			f.Close()
			if err != nil {
				logger.Warnf("failed to load catalog %s (%s), skipping.", err, path)
				continue
			}
			catalogs = append(catalogs, catalog)
		}
	}

	return catalogs
}

// SearchCatalogs looks for an Entry which matches the given name
func SearchCatalogs(catalogs []*catalog.Catalog, projectName string) *catalog.Entry {
	for _, c := range catalogs {
		// log.Printf("cat [%d]: %+v\n", n, *c)
		if e := c.Get(projectName); e != nil {
			return e
		}
	}
	return nil
}

// GetCatalogPaths returns
// func GetCatalogPaths() map[string]string {
// 	paths := make([]string, 0)

// }

// GetCatalogSources returns
func GetCatalogSources() []*catalog.Source {
	sources := make([]*catalog.Source, 0)

	sourcesPatterns := viper.GetStringSlice("sources")
	for _, pattern := range sourcesPatterns {
		matches, err := filepath.Glob(os.ExpandEnv(pattern))
		if err != nil {
			logger.Warn("bad pattern ", err)
			continue
		}
		for _, path := range matches {
			f, err := os.Open(path)
			if err != nil {
				logger.Warn(err)
				continue
			}
			sourceFile, err := catalog.LoadSource(f)
			f.Close()
			if err != nil {
				logger.Warnf("failed to load catalog source info %s (%s), skipping.", err, path)
				continue
			}
			sources = append(sources, sourceFile.Source())
		}
	}

	return sources
}
