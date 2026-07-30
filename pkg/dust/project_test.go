package dust

import (
	"archive/zip"
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/monome/maiden/pkg/catalog"
)

func TestInferProjectNameFromURL(t *testing.T) {
	cases := []struct {
		raw  string
		want string
	}{
		{"https://github.com/monome/awake", "awake"},
		{"https://github.com/monome/awake.git", "awake"},
		{"https://gitlab.com/user/myproject.git", "myproject"},
		{"https://bitbucket.org/user/repo", "repo"},
		{"https://example.com/downloads/script.zip", "script"},
		{"/tmp/archives/foo.zip", "foo"},
	}
	for _, tc := range cases {
		u, err := url.Parse(tc.raw)
		if err != nil {
			t.Fatalf("Parse(%q): %v", tc.raw, err)
		}
		got := InferProjectNameFromURL(u)
		if got != tc.want {
			t.Errorf("InferProjectNameFromURL(%q) = %q, want %q", tc.raw, got, tc.want)
		}
	}
}

func TestGetProjectsAndSearch(t *testing.T) {
	root, err := ioutil.TempDir("", "dust-projects-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(root)

	for _, name := range []string{"alpha", "beta"} {
		if err := os.Mkdir(filepath.Join(root, name), 0755); err != nil {
			t.Fatal(err)
		}
	}
	// ignored file
	if err := ioutil.WriteFile(filepath.Join(root, "readme.txt"), []byte("x"), 0644); err != nil {
		t.Fatal(err)
	}

	projects, err := GetProjects(root)
	if err != nil {
		t.Fatalf("GetProjects: %v", err)
	}
	if len(projects) != 2 {
		t.Fatalf("len(projects) = %d, want 2", len(projects))
	}
	if SearchProjects(projects, "alpha") == nil {
		t.Fatal("expected to find alpha")
	}
	if SearchProjects(projects, "missing") != nil {
		t.Fatal("missing should be nil")
	}
}

func writeZip(t *testing.T, zipPath string, files map[string]string) {
	t.Helper()
	f, err := os.Create(zipPath)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()

	w := zip.NewWriter(f)
	for name, body := range files {
		zw, err := w.Create(name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := zw.Write([]byte(body)); err != nil {
			t.Fatal(err)
		}
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}
}

func TestUnzipHappyPath(t *testing.T) {
	dir, err := ioutil.TempDir("", "dust-unzip-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(dir)

	zipPath := filepath.Join(dir, "proj.zip")
	writeZip(t, zipPath, map[string]string{
		"proj/script.lua": "-- hello",
		"proj/lib/util.lua": "return 1",
	})

	dest := filepath.Join(dir, "out")
	if err := os.Mkdir(dest, 0755); err != nil {
		t.Fatal(err)
	}
	names, err := Unzip(zipPath, dest, true)
	if err != nil {
		t.Fatalf("Unzip: %v", err)
	}
	if len(names) == 0 {
		t.Fatal("expected extracted files")
	}
	body, err := ioutil.ReadFile(filepath.Join(dest, "script.lua"))
	if err != nil {
		t.Fatalf("read script.lua: %v", err)
	}
	if string(body) != "-- hello" {
		t.Fatalf("script body = %q", body)
	}
}

func TestUnzipRejectsZipSlip(t *testing.T) {
	dir, err := ioutil.TempDir("", "dust-zipslip-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(dir)

	zipPath := filepath.Join(dir, "bad.zip")
	f, err := os.Create(zipPath)
	if err != nil {
		t.Fatal(err)
	}
	w := zip.NewWriter(f)
	// Path that escapes dest when removeArchiveRoot is false
	zw, err := w.Create("../escape.txt")
	if err != nil {
		t.Fatal(err)
	}
	zw.Write([]byte("nope"))
	w.Close()
	f.Close()

	dest := filepath.Join(dir, "out")
	os.Mkdir(dest, 0755)
	_, err = Unzip(zipPath, dest, false)
	if err == nil {
		t.Fatal("expected ZipSlip error")
	}
	if !strings.Contains(err.Error(), "illegal file path") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestInstallLocalZip(t *testing.T) {
	root, err := ioutil.TempDir("", "dust-install-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(root)

	zipPath := filepath.Join(root, "awake.zip")
	writeZip(t, zipPath, map[string]string{
		"awake/awake.lua": "return true",
	})

	entry := &catalog.Entry{
		ProjectName: "awake",
		URL:         zipPath,
		Origin:      "test",
	}
	if err := Install(root, "awake", zipPath, entry); err != nil {
		t.Fatalf("Install: %v", err)
	}

	script := filepath.Join(root, "awake", "awake.lua")
	if _, err := os.Stat(script); err != nil {
		t.Fatalf("expected installed script: %v", err)
	}
	metaPath := filepath.Join(root, "awake", ".project")
	if _, err := os.Stat(metaPath); err != nil {
		t.Fatalf("expected .project metadata: %v", err)
	}

	p := NewProject("awake", filepath.Join(root, "awake"))
	md, err := p.GetMetaData()
	if err != nil {
		t.Fatalf("GetMetaData: %v", err)
	}
	if md.SourceURL != zipPath {
		t.Fatalf("SourceURL = %q", md.SourceURL)
	}
	if md.Entry == nil || md.Entry.ProjectName != "awake" {
		t.Fatalf("unexpected catalog entry in metadata: %+v", md.Entry)
	}

	err = Install(root, "awake", zipPath, entry)
	if err == nil {
		t.Fatal("second Install should fail because project exists")
	}
	if !strings.Contains(err.Error(), "already exists") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestIsManaged(t *testing.T) {
	root, err := ioutil.TempDir("", "dust-managed-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(root)

	unmanaged := filepath.Join(root, "plain")
	os.Mkdir(unmanaged, 0755)
	p := NewProject("plain", unmanaged)
	if p.IsManaged() {
		t.Fatal("plain project should not be managed")
	}

	managed := filepath.Join(root, "gitty")
	os.MkdirAll(filepath.Join(managed, ".git"), 0755)
	p = NewProject("gitty", managed)
	if !p.IsManaged() {
		t.Fatal("project with .git should be managed")
	}
}
