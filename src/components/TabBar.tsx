import type { TabId, TabDefinition } from '../types/weather';

interface TabBarProps {
  tabs: TabDefinition[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="tab-bar" role="tablist" aria-label="Weather views">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          className={`tab-item ${activeTab === tab.id ? 'tab-item--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {activeTab === tab.id && <span className="tab-indicator" />}
        </button>
      ))}
    </nav>
  );
}
