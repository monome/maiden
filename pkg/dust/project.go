package dust

import (
	"archive/zip"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/src-d/go-git.v4"
)

// Project encapsulates a dust project
type Project struct {
	Name string
	Root string
}

func downloadURL(url string) (string, error) {
	f, err := ioutil.TempFile("/tmp", "maiden-")
	if err != nil {
		return "", err
	}
	defer f.Close()

	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	_, err = io.Copy(f, resp.Body)
	if err != nil {
		return "", err
	}

	return f.Name(), nil
}

func shortHash(hash string) string {
	return hash[0:7]
}

// Unzip will decompress a zip archive, moving all files and folders
// within the zip file (parameter 1) to an output directory (parameter 2).
func Unzip(src string, dest string, removeArchiveRoot bool) ([]string, error) {
	// https://golangcode.com/unzip-files-in-go/
	var filenames []string

	r, err := zip.OpenReader(src)
	if err != nil {
		return filenames, err
	}
	defer r.Close()

	destPrefix := filepath.Clean(dest)
	// log.Println("destPrefix", destPrefix)

	for _, f := range r.File {
		fname := f.Name
		if removeArchiveRoot {
			parts := strings.Split(fname, "/") // MAINT: is `/` always this delimiter in zip?
			fname = filepath.Join(parts[1:]...)
		}

		// Store filename/path for returning and using later on
		fpath := filepath.Join(dest, fname)
		// log.Println("destPath", fpath)

		// Check for ZipSlip. More Info: http://bit.ly/2MsjAWE
		if !strings.HasPrefix(fpath, destPrefix) {
			return filenames, fmt.Errorf("%s: illegal file path", fpath)
		}

		filenames = append(filenames, fpath)

		if f.FileInfo().IsDir() {
			// Make Folder
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		// Make File
		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return filenames, err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return filenames, err
		}

		rc, err := f.Open()
		if err != nil {
			return filenames, err
		}

		_, err = io.Copy(outFile, rc)

		// Close the file without defer to close before next iteration of loop
		outFile.Close()
		rc.Close()

		if err != nil {
			return filenames, err
		}
	}
	return filenames, nil
}

// Install installs the project at url if a project with the given name does not already exist in root
func Install(root, name, url string) error {
	path := filepath.Join(root, name)
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		return fmt.Errorf("project %s already exists in %s", name, root)
	}

	// ensure output root dir exists
	os.MkdirAll(root, os.ModePerm)

	if strings.HasSuffix(url, ".zip") {
		// do zip archive install
		archivePath, err := downloadURL(url)
		if err != nil {
			return err
		}
		defer os.Remove(archivePath)

		// TODO: deal with zip archives needing to be renamed or un-nested
		_, err = Unzip(archivePath, path, true)
		return err
	}

	// assume url is a git repo, clone it
	_, err := git.PlainClone(path, false, &git.CloneOptions{
		URL:               url,
		RecurseSubmodules: git.DefaultSubmoduleRecursionDepth,
	})

	return err
}

// GetProjects returns Project instances for all recognized projects in root
func GetProjects(root string) ([]*Project, error) {
	projects := make([]*Project, 0)
	entries, err := ioutil.ReadDir(root)
	if err != nil {
		return nil, err
	}
	for _, info := range entries {
		if info.IsDir() {
			path := filepath.Join(root, info.Name())
			projects = append(projects, NewProject(info.Name(), path))
		}
	}
	return projects, nil
}

// SearchProjects returns a pointer to the project matching name or nil
func SearchProjects(projects []*Project, name string) *Project {
	for _, p := range projects {
		if p.Name == name {
			return p
		}
	}
	return nil
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

// GetVersion returns the name of the tag at the current HEAD or the commit hash
func (p *Project) GetVersion() (string, error) {
	r, err := git.PlainOpen(p.Root)
	if err != nil {
		return "", err
	}

	ref, err := r.Head()
	if err != nil {
		return "", err
	}

	// FIXME: this doesn't seem to be working
	if tag, err := r.TagObject(ref.Hash()); err == nil {
		fmt.Printf("tag: %+v", tag)
		return tag.Name, nil
	}

	return shortHash(ref.Hash().String()), nil
}

// Update pulls down any changes for the project if it is managed via git
func (p *Project) Update(force bool) error {
	// https://github.com/src-d/go-git/blob/master/_examples/pull/main.go
	r, err := git.PlainOpen(p.Root)
	if err != nil {
		return err
	}

	w, err := r.Worktree()
	if err != nil {
		return err
	}

	return w.Pull(&git.PullOptions{
		RemoteName: "origin",
		Force:      force,
	})
}

/*
// Archive creates a zip archive of the project outputting it to the given writer
func (p *Project) Archive(out io.Writer, progress zip.ProgressFunc) error {
	return zip.Archive(p.Root, out, progress)
}
*/
