package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

type FileNode struct {
	Name     string      `json:"name"`
	Path     string      `json:"path"`
	IsDir    bool        `json:"isDir"`
	Children []*FileNode `json:"children,omitempty"`
}

type HistoryItem struct {
	Path string `json:"path"`
	Type string `json:"type"` // "file" or "folder"
}

type CacheData struct {
	RootPath     string        `json:"rootPath"`
	SidebarWidth int           `json:"sidebarWidth"`
	CurrentFile  string        `json:"currentFile"`
	History      []HistoryItem `json:"history"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) ReadFile(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (a *App) ListDir(dirPath string) ([]*FileNode, error) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	var nodes []*FileNode
	for _, entry := range entries {
		fullPath := filepath.Join(dirPath, entry.Name())
		node := &FileNode{
			Name:  entry.Name(),
			Path:  fullPath,
			IsDir: entry.IsDir(),
		}
		nodes = append(nodes, node)
	}

	return nodes, nil
}

func (a *App) GetHomeDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return homeDir, nil
}

func (a *App) GetCachePath() (string, error) {
	homeDir, err := a.GetHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(homeDir, ".markforge", "cache.json"), nil
}

func (a *App) LoadCache() (*CacheData, error) {
	cachePath, err := a.GetCachePath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(cachePath)
	if err != nil {
		if os.IsNotExist(err) {
			return &CacheData{
				RootPath:     ".",
				SidebarWidth: 300,
				CurrentFile:  "",
				History:      []HistoryItem{},
			}, nil
		}
		return nil, err
	}

	var cache CacheData
	if err := json.Unmarshal(data, &cache); err != nil {
		return nil, err
	}

	return &cache, nil
}

func (a *App) SaveCache(cache *CacheData) error {
	cachePath, err := a.GetCachePath()
	if err != nil {
		return err
	}

	cacheDir := filepath.Dir(cachePath)
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(cachePath, data, 0644)
}

func (a *App) OpenFileDialog() (string, error) {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "打开 Markdown 文件",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Markdown Files",
				Pattern:     "*.md",
			},
			{
				DisplayName: "All Files",
				Pattern:     "*",
			},
		},
	})
	if err != nil {
		return "", err
	}
	return selection, nil
}

func (a *App) OpenFolderDialog() (string, error) {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "打开文件夹",
	})
	if err != nil {
		return "", err
	}
	return selection, nil
}
