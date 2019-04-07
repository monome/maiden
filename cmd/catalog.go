package cmd

import (
	"log"
	"os"

	"github.com/monome/maiden/pkg/catalog"
	"github.com/monome/maiden/pkg/lines"
	"github.com/spf13/cobra"
)

var catalogCmd = &cobra.Command{
	Use:   "catalog",
	Short: "download scripts from llllllll.co library topics",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		catalogRun(args)
	},
}

var (
	topics bool
)

func init() {
	catalogCmd.Flags().BoolVar(&debug, "debug", false, "")
	catalogCmd.Flags().BoolVar(&topics, "topics", false, "")

	rootCmd.AddCommand(catalogCmd)
}

func catalogRun(args []string) {
	catalog := catalog.New()
	err := lines.GatherProjects(catalog)
	if err != nil {
		log.Fatalf("failed while gathering project: %s", err)
	}
	catalog.Store(os.Stdout)
}
