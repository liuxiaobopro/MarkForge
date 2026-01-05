import { useEffect, useState } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface OutlineProps {
  content: string;
  onHeadingClick: (id: string) => void;
}

export function Outline({ content, onHeadingClick }: OutlineProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const lines = content.split("\n");
    const found: Heading[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `heading-${index + 1}`;
        found.push({ level, text, id });
      }
    });

    setHeadings(found);
  }, [content]);

  if (headings.length === 0) {
    return (
      <div className="outline-empty">
        <p>暂无大纲</p>
      </div>
    );
  }

  return (
    <div className="outline-list">
      {headings.map((heading, index) => (
        <div
          key={index}
          className="outline-item"
          style={{ paddingLeft: `${(heading.level - 1) * 16 + 8}px` }}
          onClick={() => onHeadingClick(heading.id)}
        >
          <span className="outline-text">{heading.text}</span>
        </div>
      ))}
    </div>
  );
}
