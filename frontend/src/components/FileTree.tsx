import { useState, useEffect, useRef } from "react";
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
  const childrenCacheRef = useRef<Map<string, FileNode[]>>(new Map());
  const [rootNodes, setRootNodes] = useState<FileNode[]>([]);
  const prevRootPathRef = useRef<string>("");

  const loadDir = async (path: string): Promise<FileNode[]> => {
    if (childrenCacheRef.current.has(path)) {
      return childrenCacheRef.current.get(path)!;
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
      childrenCacheRef.current.set(path, sorted);
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
    const [children, setChildren] = useState<FileNode[]>(() => {
      if (node.isDir && expanded.has(node.path)) {
        const cached = childrenCacheRef.current.get(node.path);
        return cached || [];
      }
      return [];
    });
    const isExpanded = expanded.has(node.path);
    const isSelected = selected === node.path;
    const isMarkdown = !node.isDir && node.path.endsWith(".md");

    useEffect(() => {
      if (node.isDir && isExpanded) {
        const cached = childrenCacheRef.current.get(node.path);
        if (cached) {
          setChildren(cached);
        } else {
          loadDir(node.path).then(setChildren);
        }
      } else if (!isExpanded) {
        setChildren([]);
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

  useEffect(() => {
    if (rootPath && rootPath !== prevRootPathRef.current) {
      prevRootPathRef.current = rootPath;
      const cached = childrenCacheRef.current.get(rootPath);
      if (cached) {
        setRootNodes(cached);
      } else {
        loadDir(rootPath).then((items) => {
          setRootNodes(items);
        });
      }
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
