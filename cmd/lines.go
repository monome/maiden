package cmd

import (
	"log"

	"github.com/monome/maiden/pkg/lines"
	"github.com/spf13/cobra"
)

var linesCmd = &cobra.Command{
	Use:   "lines",
	Short: "download scripts from llllllll.co library topics",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		linesRun()
	},
}

var (
	topics bool
)

func init() {
	linesCmd.Flags().BoolVar(&debug, "debug", false, "")
	linesCmd.Flags().BoolVar(&topics, "topics", false, "")

	rootCmd.AddCommand(linesCmd)
}

func linesRun() {
	client := lines.NewClient("https://llllllll.co")
	categories, err := lines.GetCategories(client)
	if err != nil {
		log.Fatalf("getting categories failed with %v", err)
	}
	log.Printf("categories: %+v", categories)

	libraryCategoryID, found := lines.LookupCategoryID("Library", categories)
	if !found {
		log.Fatalf("can't find Library category ID")
	}
	log.Printf("lib id: %d", libraryCategoryID)

	topics, err := lines.GetTopics(client, libraryCategoryID)
	if err != nil {
		log.Fatalf("failed to get topics: %v", err)
	}
	for _, t := range topics {
		if lines.TopicHasTag(&t, "norns") {
			log.Printf("candidate: %+v (%d)", t.Title, t.ID)
			details, err := lines.GetTopicDetails(client, t.ID)
			if details == nil || err != nil {
				log.Printf("\tfailed to get details (%s)", err)
				continue
			}
			log.Printf("\tcreator: %s (%s)", details.CreatedBy.Name, details.CreatedBy.Username)
			log.Printf("\tlinks:")
			for i, l := range details.Links {
				log.Printf("\t%d:", i)
				log.Printf("\t\ttitle: %s", l.Title)
				log.Printf("\t\tURL: %s", l.URL)
				log.Printf("\t\tdomain: %s", l.Domain)
				log.Printf("\t\tattachment: %t", l.IsAttachment)
			}
			log.Printf("")
		}
	}
}
