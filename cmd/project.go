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

var (
	updateAllProjects bool
)

func init() {
	updateProjectCmd.Flags().BoolVar(&updateAllProjects, "all", false, "update all installed projects")

	projectCmd.AddCommand(installProjectCmd)
	projectCmd.AddCommand(updateProjectCmd)
	projectCmd.AddCommand(pushProjectCmd)
	rootCmd.AddCommand(projectCmd)
}

func ensureDustCodeRoot() string {
	// ensure dust dir
	p := os.ExpandEnv(viper.GetString("dust.code"))

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

	root := ensureDustCodeRoot()

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
	dustRoot := ensureDustCodeRoot()

	// load catalog(s)
	catalogs := GetCatalogs()
	if catalogs == nil {
		log.Fatalf("unable to load script catalog(s)")
	}

	// load projects
	projects, err := dust.GetProjects(dustRoot)
	CheckErrorFatal(err)

	// select which projects to update
	var candidates []*dust.Project
	candidates = make([]*dust.Project, 0)
	if updateAllProjects {
		candidates = projects
	} else {
		for _, name := range args {
			if p := dust.SearchProjects(projects, name); p != nil {
				candidates = append(candidates, p)
			} else {
				fmt.Println("Unknown project:", name)
			}
		}
	}

	// do the work
	for _, p := range candidates {
		fmt.Printf("Updating: %s ... ", p.Name)
		if p.IsManaged() {
			err = p.Update(true)
			CheckErrorNonFatal(err, "done.")
		} else {
			// assume zip
			if entry := SearchCatalogs(catalogs, p.Name); entry != nil {
				// TODO: only remove if download succeds?
				os.RemoveAll(p.Root)
				err = dust.Install(dustRoot, p.Name, entry.URL)
				CheckErrorNonFatal(err, "done.")
			} else {
				fmt.Printf("failed: cannot find in catalog")
			}
		}
	}
}

func pushProjectRun(args []string) {
	log.Printf("args: %+v", args)
}
