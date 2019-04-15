package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use:   "maiden",
	Short: "web editor for norns scripts",
}

var debug bool

func init() {
	rootCmd.PersistentFlags().BoolVar(&debug, "debug", false, "enable debug logging")
}

// Execute add all child commands to the root command and defaults flags
// appropriately (called from main.main())
func Execute() {
	viper.SetConfigName("maiden")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("$HOME/.maidenconfig")
	viper.AddConfigPath(".")

	viper.ReadInConfig()

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

// CheckErrorFatal logs a fatal error if error value is non-nil
func CheckErrorFatal(e error) {
	if e != nil {
		log.Fatal(e)
	}
}

// CheckErrorNonFatal logs the error if error value is non-nil, returning true if there was an error
func CheckErrorNonFatal(e error, ok string) bool {
	if e != nil {
		log.Println(e)
		return true
	}
	log.Println(ok)
	return false
}
