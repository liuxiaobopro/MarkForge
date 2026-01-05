import { useState } from "react";

interface HistoryItem {
  path: string;
  type: string;
}

interface MenuBarProps {
  onOpenFile: () => void;
  onOpenFolder: () => void;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
}

export function MenuBar({
  onOpenFile,
  onOpenFolder,
  history,
  onHistorySelect,
}: MenuBarProps) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="menu-bar">
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
          <div className="menu-dropdown">
            {history.map((item, index) => {
              return (
                <div
                  key={index}
                  className="menu-dropdown-item"
                  onClick={() => {
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
    </div>
  );
}
