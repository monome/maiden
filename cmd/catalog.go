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
		catalogListRun(args)
	},
}

var catalogInitCmd = &cobra.Command{
	Use:   "init",
	Short: "init an empty catalog file",
	Args:  cobra.RangeArgs(1, 1),
	Run: func(cmd *cobra.Command, args []string) {
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

	w := new(tabwriter.Writer)
	w.Init(os.Stdout, 0, 8, 0, '\t', 0)

	for _, pattern := range catalogPatterns {
		matches, err := filepath.Glob(os.ExpandEnv(pattern))
		if err != nil {
			fmt.Printf("WARN: bad pattern %s\n", err)
			continue
		}
		for _, path := range matches {
			f, err := os.Open(path)
			if err != nil {
				fmt.Printf("WARN: %s\n", err)
				continue
			}
			catalog, err := catalog.Load(f)
			f.Close()
			if err != nil {
				fmt.Printf("WARN: load error: %s (%s)\n", err, path)
				continue
			}

			fmt.Fprintf(os.Stdout, "[ %s ]\n", path)
			fmt.Fprintln(w, "project\tsource\turl\t")
			fmt.Fprintln(w, "-------\t------\t---\t")
			for _, entry := range catalog.Entries() {
				fmt.Fprintf(w, "%s\t%s\t%s\t\n", entry.ProjectName, entry.Origin, entry.URL)
			}
			w.Flush()
		}
	}
}

func catalogInitRun(args []string) {
	c := catalog.New()
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
			fmt.Printf("WARN: bad pattern %s\n", err)
			continue
		}
		for _, path := range matches {
			f, err := os.Open(path)
			if err != nil {
				fmt.Printf("WARN: %s\n", err)
				continue
			}
			catalog, err := catalog.Load(f)
			f.Close()
			if err != nil {
				fmt.Printf("WARN: load error: %s (%s)\n", err, path)
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
