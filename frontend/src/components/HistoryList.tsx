import { ReadFile } from "@wails/go/main/App";

interface HistoryListProps {
  history: string[];
  onFileSelect: (path: string, content: string) => void;
  onRemove: (path: string) => void;
}

export function HistoryList({
  history,
  onFileSelect,
  onRemove,
}: HistoryListProps) {
  const handleClick = async (path: string) => {
    try {
      const content = await ReadFile(path);
      onFileSelect(path, content);
    } catch (error) {
      console.error("Failed to read file:", error);
    }
  };

  const handleRemove = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    onRemove(path);
  };

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p>暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {history.map((path) => (
        <div
          key={path}
          className="history-item"
          onClick={() => handleClick(path)}
        >
          <span className="history-path">{path}</span>
          <button
            className="history-remove"
            onClick={(e) => handleRemove(e, path)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
