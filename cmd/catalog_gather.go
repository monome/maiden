package cmd

import (
	"log"
	"os"

	"github.com/monome/maiden/pkg/catalog"
	"github.com/monome/maiden/pkg/lines"
	"github.com/spf13/cobra"
)

var catalogGatherCmd = &cobra.Command{
	Use:   "gather",
	Short: "gather script details from various sources",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		catalogGatherRun()
	},
}

var (
	gatherLines bool
)

func init() {
	catalogGatherCmd.Flags().BoolVar(&gatherLines, "lines", true, "examine llllllll.co library topics")

	catalogCmd.AddCommand(catalogGatherCmd)
}

func catalogGatherRun() {
	catalog := catalog.New()

	if gatherLines {
		err := lines.GatherProjects(catalog)
		if err != nil {
			log.Fatalf("failed while gathering project: %s", err)
		}
	}

	catalog.Store(os.Stdout)
}
