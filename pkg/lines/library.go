package lines

import (
	"encoding/json"
	"fmt"
)

// Category captures a subset of the properties of a Discourse category
type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// CategoryList captures a subset of the properties for a Discourse category listing
type categoryList struct {
	Categories []Category `json:"categories"`
}

type getCategoryResponse struct {
	CategoryList categoryList `json:"category_list"`
}

// Topic represents a Topic resource from the Discourse API
type Topic struct {
	ID         int      `json:"id"`
	Title      string   `json:"title"`
	FancyTitle string   `json:"fancy_title"`
	PostsCount int      `json:"posts_count"`
	CategoryID int      `json:"category_id"`
	Tags       []string `json:"tags"`
	IsVisible  bool     `json:"visible"`
	IsArchived bool     `json:"archived"`
}

type topicList struct {
	Topics []Topic `json:"topics"`
}

type getCategoryTopicsResponse struct {
	TopicList topicList `json:"topic_list"`
}

type CreatedBy struct {
	AvatarTemplate string `json:"avatar_template"`
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Username       string `json:"username"`
}

type Link struct {
	IsAttachment bool   `json:"attachment"`
	Domain       string `json:"domain"`
	Title        string `json:"title"`
	URL          string `json:"url"`
	UserID       int    `json:"user_id"`
}

type Details struct {
	CreatedBy CreatedBy `json:"created_by"`
	Links     []Link    `json:"links"`
}

type getTopicPostsResponse struct {
	Details Details `json:"details"`
}

func GetCategories(client *Client) ([]Category, error) {
	body, _, err := client.Get("/categories.json")
	if err != nil {
		return nil, err
	}

	var content getCategoryResponse
	err = json.Unmarshal(body, &content)
	if err != nil {
		return nil, err
	}
	// log.Printf("cl: %v", content)
	return content.CategoryList.Categories, nil
}

func LookupCategoryID(name string, categories []Category) (int, bool) {
	for _, c := range categories {
		if c.Name == name {
			return c.ID, true
		}
	}
	return 0, false
}

func GetTopics(client *Client, categoryID int) ([]Topic, error) {
	url := fmt.Sprintf("/c/%d.json", categoryID)
	body, _, err := client.Get(url)
	if err != nil {
		return nil, err
	}

	var content getCategoryTopicsResponse
	err = json.Unmarshal(body, &content)
	if err != nil {
		return nil, err
	}

	return content.TopicList.Topics, nil
}

func TopicHasTag(t *Topic, tag string) bool {
	for _, n := range t.Tags {
		if n == tag {
			return true
		}
	}
	return false
}

func GetTopicDetails(client *Client, topicID int) (*Details, error) {
	url := fmt.Sprintf("/t/%d.json", topicID)
	body, _, err := client.Get(url)
	if err != nil {
		return nil, err
	}

	var content getTopicPostsResponse
	err = json.Unmarshal(body, &content)
	if err != nil {
		return nil, err
	}

	return &content.Details, nil
}
