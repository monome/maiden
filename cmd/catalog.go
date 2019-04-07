package cmd

import (
	"github.com/spf13/cobra"
)

var catalogCmd = &cobra.Command{
	Use:   "catalog",
	Short: "manage the script catalog",
	Args:  cobra.NoArgs,
	// Run: func(cmd *cobra.Command, args []string) {
	// 	catalogRun(args)
	// },
}

func init() {
	rootCmd.AddCommand(catalogCmd)
}

// func catalogRun() {
// }
