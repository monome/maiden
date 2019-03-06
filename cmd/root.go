package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "maiden",
	Short: "web editor for norns scripts",
}

// Execute add all child commands to the root command and defaults flags
// appropriately (called from main.main())
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
