import { useEffect, useRef } from "react";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onScroll?: (scrollTop: number) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

export function MarkdownEditor({ content, onChange, onScroll, editorRef: externalEditorRef }: MarkdownEditorProps) {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = externalEditorRef || internalTextareaRef;

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== content) {
      textareaRef.current.value = content;
    }
  }, [content, textareaRef]);

  const handleScroll = () => {
    if (textareaRef.current && onScroll) {
      onScroll(textareaRef.current.scrollTop);
    }
  };

  return (
    <div className="markdown-editor" ref={editorRef}>
      <textarea
        ref={textareaRef}
        className="markdown-editor-textarea"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder="开始编写 Markdown..."
        spellCheck={false}
      />
    </div>
  );
}

