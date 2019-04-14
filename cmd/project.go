package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/monome/maiden/pkg/dust"
)

var projectCmd = &cobra.Command{
	Use:   "project",
	Short: "manage dust projects",
}

var installProjectCmd = &cobra.Command{
	Use:   "install",
	Short: "install a script/project",
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		installProjectRun(args)
	},
}

var updateProjectCmd = &cobra.Command{
	Use:   "update",
	Short: "install a script/project",
	// Args:  cobra.,
	Run: func(cmd *cobra.Command, args []string) {
		updateProjectRun(args)
	},
}

var pushProjectCmd = &cobra.Command{
	Use:   "push",
	Short: "push a git based project",
	// Args:  cobra.,
	Run: func(cmd *cobra.Command, args []string) {
		pushProjectRun(args)
	},
}

func init() {
	projectCmd.AddCommand(installProjectCmd)
	projectCmd.AddCommand(updateProjectCmd)
	projectCmd.AddCommand(pushProjectCmd)
	rootCmd.AddCommand(projectCmd)
}

func ensureDustRoot() string {
	// ensure dust dir
	p := os.ExpandEnv(viper.GetString("dust.path"))

	if _, err := os.Stat(p); os.IsNotExist(err) {
		log.Fatalf("dust directory %s does not exist", p)
	}
	return p
}

func installProjectRun(args []string) {
	// load catalog(s)
	catalogs := GetCatalogs()
	if catalogs == nil {
		log.Fatalf("unable to load script catalog(s)")
	}

	root := ensureDustRoot()

	// install projects
	for _, name := range args {
		if entry := SearchCatalogs(catalogs, name); entry != nil {
			fmt.Printf("Installing: %s (%s)... ", entry.ProjectName, entry.URL)
			err := dust.Install(root, name, entry.URL)
			if err != nil {
				fmt.Printf("failed: %s\n", err)
			} else {
				fmt.Printf("done.\n")
			}
		} else {
			log.Printf("Unknown project: %s", name)
		}
	}
}

func updateProjectRun(args []string) {
	log.Printf("args: %+v", args)

}

func pushProjectRun(args []string) {
	log.Printf("args: %+v", args)
}
