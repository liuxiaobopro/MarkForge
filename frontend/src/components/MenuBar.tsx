import { useState } from "react";
import { WindowControls } from "./WindowControls";
import logo from "@/assets/images/logo.png";

interface HistoryItem {
  path: string;
  type: string;
}

type ViewMode = "preview" | "split";
type ThemeMode = "light" | "dark" | "system";

interface MenuBarProps {
  onOpenFile: () => void;
  onOpenFolder: () => void;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export function MenuBar({
  onOpenFile,
  onOpenFolder,
  history,
  onHistorySelect,
  viewMode,
  onViewModeChange,
  themeMode,
  onThemeChange,
}: MenuBarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showViewMode, setShowViewMode] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  return (
    <div className="menu-bar">
      <div className="menu-bar-left">
        <img src={logo} alt="MarkForge" className="menu-logo" />
        <div className="menu-item" onClick={onOpenFile}>
          打开
        </div>
        <div className="menu-item" onClick={onOpenFolder}>
          打开文件夹
        </div>
        <div
          className="menu-item"
          onMouseEnter={() => setShowHistory(true)}
          onMouseLeave={() => setShowHistory(false)}
        >
          历史记录
          {showHistory && history.length > 0 && (
            <div
              className="menu-dropdown"
              onMouseEnter={() => setShowHistory(true)}
              onMouseLeave={() => setShowHistory(false)}
            >
              {history.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="menu-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHistorySelect(item);
                      setShowHistory(false);
                    }}
                  >
                    <span className="history-icon">
                      {item.type === "file" ? "📄" : "📁"}
                    </span>
                    <span className="history-path">{item.path}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div
          className="menu-item"
          onMouseEnter={() => setShowViewMode(true)}
          onMouseLeave={() => setShowViewMode(false)}
        >
          视图
          {showViewMode && (
            <div
              className="menu-dropdown"
              onMouseEnter={() => setShowViewMode(true)}
              onMouseLeave={() => setShowViewMode(false)}
            >
              <div
                className={`menu-dropdown-item ${
                  viewMode === "preview" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewModeChange("preview");
                  setShowViewMode(false);
                }}
              >
                <span className="menu-check">
                  {viewMode === "preview" ? "✓" : ""}
                </span>
                仅预览
              </div>
              <div
                className={`menu-dropdown-item ${
                  viewMode === "split" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewModeChange("split");
                  setShowViewMode(false);
                }}
              >
                <span className="menu-check">
                  {viewMode === "split" ? "✓" : ""}
                </span>
                左右分屏
              </div>
            </div>
          )}
        </div>
        <div
          className="menu-item"
          onMouseEnter={() => setShowTheme(true)}
          onMouseLeave={() => setShowTheme(false)}
        >
          主题
          {showTheme && (
            <div
              className="menu-dropdown"
              onMouseEnter={() => setShowTheme(true)}
              onMouseLeave={() => setShowTheme(false)}
            >
              <div
                className={`menu-dropdown-item ${
                  themeMode === "light" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onThemeChange("light");
                  setShowTheme(false);
                }}
              >
                <span className="menu-check">
                  {themeMode === "light" ? "✓" : ""}
                </span>
                明亮
              </div>
              <div
                className={`menu-dropdown-item ${
                  themeMode === "dark" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onThemeChange("dark");
                  setShowTheme(false);
                }}
              >
                <span className="menu-check">
                  {themeMode === "dark" ? "✓" : ""}
                </span>
                黑暗
              </div>
              <div
                className={`menu-dropdown-item ${
                  themeMode === "system" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onThemeChange("system");
                  setShowTheme(false);
                }}
              >
                <span className="menu-check">
                  {themeMode === "system" ? "✓" : ""}
                </span>
                跟随系统
              </div>
            </div>
          )}
        </div>
      </div>
      <WindowControls />
    </div>
  );
}
