package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var version = "0.6.0"

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "print maiden version",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		ConfigureLogger()
		LoadConfiguration()
		fmt.Println(version)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
