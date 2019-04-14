package cmd

import (
	"fmt"
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

func init() {
	catalogCmd.AddCommand(catalogListCmd)
	rootCmd.AddCommand(catalogCmd)
}

func catalogListRun(args []string) {
	catalogPatterns := viper.GetStringSlice("catalogs")

	w := new(tabwriter.Writer)
	w.Init(os.Stdout, 0, 8, 0, '\t', 0)

	for _, pattern := range catalogPatterns {
		matches, err := filepath.Glob(pattern)
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
			fmt.Fprintln(w, "project\turl\t")
			fmt.Fprintln(w, "-------\t---\t")
			for _, entry := range catalog.Entries() {
				fmt.Fprintf(w, "%s\t%s\t\n", entry.ProjectName, entry.URL)
			}
		}
	}
	w.Flush()
}
