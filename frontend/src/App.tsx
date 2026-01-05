import { useState, useEffect, useRef } from "react";
import "./App.css";
import { FileTree } from "@/components/FileTree";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Resizer } from "@/components/Resizer";
import { Tabs } from "@/components/Tabs";
import { Outline } from "@/components/Outline";
import { CurrentFiles } from "@/components/CurrentFiles";
import { MenuBar } from "@/components/MenuBar";
import {
  ReadFile,
  LoadCache,
  SaveCache,
  OpenFileDialog,
  OpenFolderDialog,
} from "@wails/go/main/App";
import { main } from "@wails/go/models";

function App() {
  const [content, setContent] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [history, setHistory] = useState<Array<{ path: string; type: string }>>(
    []
  );
  const [activeTab, setActiveTab] = useState("current");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const markdownViewerRef = useRef<HTMLDivElement>(null);
  const sidebarWidth = 300;

  useEffect(() => {
    loadCache();
  }, []);

  useEffect(() => {
    if (rootPath) {
      saveCacheDebounced();
    }
  }, [rootPath, currentFile, history]);

  const loadCache = async () => {
    try {
      const cache = await LoadCache();
      if (cache) {
        setRootPath(cache.rootPath || ".");
        const historyData = cache.history || [];
        setHistory(
          historyData.map((item: any) => ({
            path: typeof item === "string" ? item : item.path,
            type: typeof item === "string" ? "file" : item.type || "file",
          }))
        );
        if (cache.currentFile) {
          try {
            const fileContent = await ReadFile(cache.currentFile);
            setContent(fileContent);
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

  const handleFileSelect = (path: string, fileContent: string) => {
    setContent(fileContent);
    setCurrentFile(path);
    addToHistory(path, "file");
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
        handleFileSelect(path, content);
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const handleHistorySelect = async (item: { path: string; type: string }) => {
    try {
      if (item.type === "file") {
        const content = await ReadFile(item.path);
        handleFileSelect(item.path, content);
      } else {
        setRootPath(item.path);
        addToHistory(item.path, "folder");
      }
    } catch (error) {
      console.error("Failed to read file:", error);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const path = await OpenFolderDialog();
      if (path) {
        setRootPath(path);
        addToHistory(path, "folder");
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
        <main className="app-main">
          {content ? (
            <div ref={markdownViewerRef}>
              <MarkdownViewer content={content} />
            </div>
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
