package cmd

import (
	"github.com/spf13/cobra"
)

var catalogCmd = &cobra.Command{
	Use:   "catalog",
	Short: "manage the script catalog",
	Args:  cobra.NoArgs,
}

func init() {
	rootCmd.AddCommand(catalogCmd)
}
