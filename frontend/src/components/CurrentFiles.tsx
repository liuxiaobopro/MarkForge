import { ReadFile } from "@wails/go/main/App";

interface CurrentFilesProps {
  currentFile: string;
  onFileSelect: (path: string, content: string) => void;
}

export function CurrentFiles({
  currentFile,
  onFileSelect,
}: CurrentFilesProps) {
  if (!currentFile) {
    return (
      <div className="current-empty">
        <p>暂无打开的文件</p>
      </div>
    );
  }

  const fileName = currentFile.split(/[/\\]/).pop() || currentFile;

  return (
    <div className="current-list">
      <div
        className="current-item active"
        onClick={async () => {
          try {
            const content = await ReadFile(currentFile);
            onFileSelect(currentFile, content);
          } catch (error) {
            console.error("Failed to read file:", error);
          }
        }}
      >
        <span className="current-icon">📄</span>
        <span className="current-name">{fileName}</span>
      </div>
    </div>
  );
}
