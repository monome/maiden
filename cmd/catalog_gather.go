package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/monome/maiden/pkg/catalog"
	"github.com/monome/maiden/pkg/lines"
	"github.com/spf13/cobra"
)

var catalogGatherCmd = &cobra.Command{
	Use:   "gather",
	Short: "gather script details from various sources",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		catalogGatherRun(args)
	},
}

var (
	gatherLines bool
)

func init() {
	catalogGatherCmd.Flags().BoolVar(&gatherLines, "lines", false, "examine llllllll.co library topics")

	catalogCmd.AddCommand(catalogGatherCmd)
}

func catalogGatherRun(args []string) {
	var destination *os.File
	var err error

	s := len(args)
	if s == 0 || args[0] == "-" {
		destination = os.Stdout
	} else {
		destination, err = os.Create(args[0])
		if err != nil {
			log.Fatalf("%s", err)
		}
		defer destination.Close()
	}

	catalog := catalog.New()

	if gatherLines {
		err := lines.GatherProjects(catalog)
		if err != nil {
			log.Fatalf("failed while gathering project: %s", err)
		}
	}

	err = catalog.Store(destination)
	if err != nil {
		log.Fatal(err)
	}

	if destination == os.Stdout {
		fmt.Println("")
	}
}
