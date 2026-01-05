import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const components = {
    h1: ({ node, ...props }: any) => {
      const id = `heading-${node.position?.start.line || 1}`;
      return <h1 id={id} {...props} />;
    },
    h2: ({ node, ...props }: any) => {
      const id = `heading-${node.position?.start.line || 1}`;
      return <h2 id={id} {...props} />;
    },
    h3: ({ node, ...props }: any) => {
      const id = `heading-${node.position?.start.line || 1}`;
      return <h3 id={id} {...props} />;
    },
    h4: ({ node, ...props }: any) => {
      const id = `heading-${node.position?.start.line || 1}`;
      return <h4 id={id} {...props} />;
    },
    h5: ({ node, ...props }: any) => {
      const id = `heading-${node.position?.start.line || 1}`;
      return <h5 id={id} {...props} />;
    },
    h6: ({ node, ...props }: any) => {
      const id = `heading-${node.position?.start.line || 1}`;
      return <h6 id={id} {...props} />;
    },
  };

  return (
    <div className="markdown-viewer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
