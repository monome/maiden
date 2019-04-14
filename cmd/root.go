package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use:   "maiden",
	Short: "web editor for norns scripts",
}

// Execute add all child commands to the root command and defaults flags
// appropriately (called from main.main())
func Execute() {
	viper.SetConfigName("maiden")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("$HOME/.maidenconfig")
	viper.AddConfigPath(".")

	viper.ReadInConfig()
	// if err != nil {
	// 	panic(fmt.Errorf("config file error: %s", err))
	// }

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
