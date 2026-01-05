import { useState, useEffect, useRef } from "react";
import "./App.css";
import { FileTree } from "@/components/FileTree";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Resizer } from "@/components/Resizer";
import { Tabs } from "@/components/Tabs";
import { Outline } from "@/components/Outline";
import { CurrentFiles } from "@/components/CurrentFiles";
import { MenuBar } from "@/components/MenuBar";
import {
  ReadFile,
  WriteFile,
  ListDir,
  LoadCache,
  SaveCache,
  OpenFileDialog,
  OpenFolderDialog,
} from "@wails/go/main/App";
import { main } from "@wails/go/models";
import { EventsOn } from "../wailsjs/runtime/runtime";

function App() {
  const [content, setContent] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [history, setHistory] = useState<Array<{ path: string; type: string }>>(
    []
  );
  const [activeTab, setActiveTab] = useState("current");
  const [viewMode, setViewMode] = useState<"preview" | "split">("preview");
  const [editContent, setEditContent] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const markdownViewerRef = useRef<HTMLDivElement>(null);
  const markdownEditorRef = useRef<HTMLDivElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isScrollingRef = useRef(false);
  const sidebarWidth = 300;

  useEffect(() => {
    loadCache();
  }, []);

  useEffect(() => {
    const handleOpenPath = (data: any) => {
      if (data && data.path) {
        if (data.type === "file") {
          ReadFile(data.path)
            .then((content) => {
              const lastSlash = Math.max(data.path.lastIndexOf("\\"), data.path.lastIndexOf("/"));
              if (lastSlash > 0) {
                const dirPath = data.path.substring(0, lastSlash);
                setRootPath((prev) => dirPath !== prev ? dirPath : prev);
              }
              setContent(content);
              setEditContent(content);
              setCurrentFile(data.path);
              addToHistory(data.path, "file");
            })
            .catch((error) => {
              console.error("Failed to open file:", error);
            });
        } else if (data.type === "folder") {
          ListDir(data.path)
            .then(() => {
              setRootPath(data.path);
              addToHistory(data.path, "folder");
            })
            .catch((error) => {
              console.error("Failed to open folder:", error);
            });
        }
      }
    };

    const unsubscribe = EventsOn("open-path", handleOpenPath);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (rootPath) {
      saveCacheDebounced();
    }
  }, [rootPath, currentFile, history]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFile, editContent]);

  const loadCache = async () => {
    try {
      const cache = await LoadCache();
      if (cache) {
        setRootPath(cache.rootPath || ".");
        const historyData = cache.history || [];
        setHistory(
          historyData
            .map((item: any) => ({
              path: typeof item === "string" ? item : item.path || "",
              type: typeof item === "string" ? "file" : item.type || "file",
            }))
            .filter((item: any) => item.path)
        );
        if (cache.currentFile) {
          try {
            const fileContent = await ReadFile(cache.currentFile);
            setContent(fileContent);
            setEditContent(fileContent);
            setCurrentFile(cache.currentFile);
          } catch (error) {
            console.error("Failed to load cached file:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load cache:", error);
      setRootPath(".");
    }
  };

  const saveCache = async () => {
    try {
      const cache = new main.CacheData({
        rootPath,
        sidebarWidth: 300,
        currentFile,
        history,
      });
      await SaveCache(cache);
    } catch (error) {
      console.error("Failed to save cache:", error);
    }
  };

  const saveCacheDebounced = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveCache, 500);
  };

  const addToHistory = (path: string, type: "file" | "folder") => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.path !== path);
      return [{ path, type }, ...filtered].slice(0, 20);
    });
  };

  const handleFileSelect = (path: string, fileContent: string, addHistory: boolean = false) => {
    setContent(fileContent);
    setEditContent(fileContent);
    setCurrentFile(path);
    if (addHistory) {
      addToHistory(path, "file");
    }
  };

  const handleContentChange = (newContent: string) => {
    setEditContent(newContent);
  };

  const handleEditorScroll = (scrollTop: number) => {
    if (viewMode === "split" && !isScrollingRef.current && markdownViewerRef.current && editorTextareaRef.current) {
      isScrollingRef.current = true;
      const viewer = markdownViewerRef.current;
      const editor = editorTextareaRef.current;
      const editorScrollRatio = scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
      const viewerScrollTop = editorScrollRatio * (viewer.scrollHeight - viewer.clientHeight);
      viewer.scrollTop = viewerScrollTop;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
  };

  const handleViewerScroll = () => {
    if (viewMode === "split" && !isScrollingRef.current && editorTextareaRef.current && markdownViewerRef.current) {
      isScrollingRef.current = true;
      const viewer = markdownViewerRef.current;
      const editor = editorTextareaRef.current;
      const viewerScrollRatio = viewer.scrollTop / (viewer.scrollHeight - viewer.clientHeight || 1);
      const editorScrollTop = viewerScrollRatio * (editor.scrollHeight - editor.clientHeight);
      editor.scrollTop = editorScrollTop;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
  };

  const handleSaveFile = async () => {
    if (!currentFile) return;
    try {
      await WriteFile(currentFile, editContent);
      setContent(editContent);
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  };

  const handleHeadingClick = (id: string) => {
    const element = markdownViewerRef.current?.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenFile = async () => {
    try {
      const path = await OpenFileDialog();
      if (path) {
        const content = await ReadFile(path);
        handleFileSelect(path, content, true);
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const handleHistorySelect = async (item: { path: string; type: string }) => {
    try {
      if (!item.path) {
        console.error("Invalid history item:", item);
        return;
      }
      if (item.type === "file") {
        const content = await ReadFile(item.path);
        const lastSlash = Math.max(item.path.lastIndexOf("\\"), item.path.lastIndexOf("/"));
        if (lastSlash > 0) {
          const dirPath = item.path.substring(0, lastSlash);
          setRootPath((prev) => dirPath !== prev ? dirPath : prev);
        }
        handleFileSelect(item.path, content, false);
      } else if (item.type === "folder") {
        try {
          await ListDir(item.path);
          setRootPath(item.path);
        } catch (error) {
          console.error("Failed to open folder:", error);
        }
      }
    } catch (error) {
      console.error("Failed to handle history select:", error);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const path = await OpenFolderDialog();
      if (path) {
        try {
          await ListDir(path);
          setRootPath(path);
          addToHistory(path, "folder");
        } catch (error) {
          console.error("Failed to access folder:", error);
        }
      }
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  };

  return (
    <div id="App">
      <MenuBar
        onOpenFile={handleOpenFile}
        onOpenFolder={handleOpenFolder}
        history={history}
        onHistorySelect={handleHistorySelect}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="app-layout">
        <aside className="app-sidebar" style={{ width: `${sidebarWidth}px` }}>
          <div className="sidebar-header">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <div className="sidebar-content">
            {activeTab === "current" && rootPath && (
              <FileTree rootPath={rootPath} onFileSelect={handleFileSelect} />
            )}
            {activeTab === "outline" && (
              <Outline content={content} onHeadingClick={handleHeadingClick} />
            )}
          </div>
        </aside>
        <Resizer />
        <main className={`app-main view-mode-${viewMode}`}>
          {currentFile ? (
            <>
              {viewMode === "preview" && (
                <div ref={markdownViewerRef} className="markdown-container">
                  <MarkdownViewer content={content} />
                </div>
              )}
              {viewMode === "split" && (
                <div className="split-container">
                  <div ref={markdownEditorRef} className="split-editor">
                    <MarkdownEditor
                      content={editContent}
                      onChange={handleContentChange}
                      onScroll={handleEditorScroll}
                      editorRef={editorTextareaRef}
                    />
                  </div>
                  <div className="split-divider"></div>
                  <div ref={markdownViewerRef} className="split-preview" onScroll={handleViewerScroll}>
                    <MarkdownViewer content={editContent} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>请选择一个 Markdown 文件开始浏览</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
