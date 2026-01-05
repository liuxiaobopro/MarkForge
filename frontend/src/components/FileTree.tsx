import { useState, useEffect } from "react";
import { ReadFile, ListDir } from "@wails/go/main/App";
import { main } from "@wails/go/models";

type FileNode = main.FileNode;

interface FileTreeProps {
  rootPath: string;
  onFileSelect: (path: string, content: string) => void;
}

export function FileTree({ rootPath, onFileSelect }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string>("");
  const [childrenCache, setChildrenCache] = useState<Map<string, FileNode[]>>(
    new Map()
  );

  const loadDir = async (path: string): Promise<FileNode[]> => {
    if (childrenCache.has(path)) {
      return childrenCache.get(path)!;
    }
    try {
      const items = await ListDir(path);
      const filtered = items.filter(
        (item) => item.isDir || item.path.endsWith(".md")
      );
      const sorted = filtered.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });
      setChildrenCache((prev) => new Map(prev).set(path, sorted));
      return sorted;
    } catch (error) {
      console.error("Failed to load directory:", error);
      return [];
    }
  };

  const toggleExpand = async (node: FileNode) => {
    if (!node.isDir) {
      if (node.path.endsWith(".md")) {
        try {
          const content = await ReadFile(node.path);
          setSelected(node.path);
          onFileSelect(node.path, content);
        } catch (error) {
          console.error("Failed to read file:", error);
        }
      }
      return;
    }

    const newExpanded = new Set(expanded);
    if (newExpanded.has(node.path)) {
      newExpanded.delete(node.path);
    } else {
      newExpanded.add(node.path);
      await loadDir(node.path);
    }
    setExpanded(newExpanded);
  };

  const TreeNode = ({ node, level }: { node: FileNode; level: number }) => {
    const [children, setChildren] = useState<FileNode[]>([]);
    const isExpanded = expanded.has(node.path);
    const isSelected = selected === node.path;
    const isMarkdown = !node.isDir && node.path.endsWith(".md");

    useEffect(() => {
      if (node.isDir && isExpanded) {
        loadDir(node.path).then((items) => {
          const filtered = items.filter(
            (item) => item.isDir || item.path.endsWith(".md")
          );
          const sorted = filtered.sort((a, b) => {
            if (a.isDir && !b.isDir) return -1;
            if (!a.isDir && b.isDir) return 1;
            return a.name.localeCompare(b.name);
          });
          setChildren(sorted);
        });
      }
    }, [node.path, isExpanded]);

    return (
      <div>
        <div
          className={`tree-node ${isSelected ? "selected" : ""} ${
            isMarkdown ? "markdown-file" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => toggleExpand(node)}
        >
          <span className="tree-icon">
            {node.isDir ? (isExpanded ? "📂" : "📁") : isMarkdown ? "📄" : "📋"}
          </span>
          <span className="tree-name">{node.name}</span>
        </div>
        {node.isDir && isExpanded && (
          <div>
            {children.map((child) => (
              <TreeNode key={child.path} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const [rootNodes, setRootNodes] = useState<FileNode[]>([]);

  useEffect(() => {
    if (rootPath) {
      setChildrenCache(new Map());
      loadDir(rootPath).then((items) => {
        const filtered = items.filter(
          (item) => item.isDir || item.path.endsWith(".md")
        );
        const sorted = filtered.sort((a, b) => {
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
          return a.name.localeCompare(b.name);
        });
        setRootNodes(sorted);
      });
    }
  }, [rootPath]);

  return (
    <div className="file-tree">
      {rootNodes.map((node) => (
        <TreeNode key={node.path} node={node} level={0} />
      ))}
    </div>
  );
}
