package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/monome/maiden/pkg/catalog"
	"github.com/monome/maiden/pkg/lines"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var catalogUpdateCmd = &cobra.Command{
	Use:   "update",
	Short: "update configured catalogs",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		catalogUpdateRun(args)
	},
}

func init() {
	catalogCmd.AddCommand(catalogUpdateCmd)
}

func catalogUpdateRun(args []string) {
	if viper.IsSet("sources.lines") {
		fmt.Println("Fetching topics from lines... ")
		catalog := catalog.New()
		err := lines.GatherProjects(catalog)
		if err != nil {
			log.Fatalf("failed while gathering project: %s", err)
		}
		path := viper.GetString("sources.lines")
		destination, err := os.Create(path)
		if err != nil {
			log.Fatalf("%s", err)
		}
		defer destination.Close()
		err = catalog.Store(destination)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Wrote: %s\n", path)
	}
}
