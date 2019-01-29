package dust

import (
	"os"
	"path/filepath"
)

// Project encapsulates a dust project
type Project struct {
	Name string
	Root string
}

// NewProject creates a Project for the given name and root directory
func NewProject(name string, root string) *Project {
	return &Project{
		Name: name,
		Root: root,
	}
}

// IsManaged returns true if the project appears to be managed as a git repo
func (p *Project) IsManaged() bool {
	d := filepath.Join(p.Root, ".git")
	if stat, err := os.Lstat(d); err == nil && stat.IsDir() {
		return true
	}
	return false
}
