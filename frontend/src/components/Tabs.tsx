interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === "current" ? "active" : ""}`}
        onClick={() => onTabChange("current")}
      >
        当前
      </button>
      <button
        className={`tab ${activeTab === "outline" ? "active" : ""}`}
        onClick={() => onTabChange("outline")}
      >
        大纲
      </button>
    </div>
  );
}
