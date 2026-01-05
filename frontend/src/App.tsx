import { useState } from "react";
import "./App.css";
import { FileSelector } from "@/components/FileSelector";
import { MarkdownViewer } from "@/components/MarkdownViewer";

function App() {
  const [content, setContent] = useState("");

  const handleFileSelect = async (file: File) => {
    const text = await file.text();
    setContent(text);
  };

  return (
    <div id="App">
      <header className="app-header">
        <h1>MarkForge</h1>
        <FileSelector onFileSelect={handleFileSelect} />
      </header>
      <main className="app-main">
        {content ? (
          <MarkdownViewer content={content} />
        ) : (
          <div className="empty-state">
            <p>请选择一个 Markdown 文件开始浏览</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

