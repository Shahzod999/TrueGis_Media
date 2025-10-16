import React, { useState } from "react";
import styles from "./ToggleTabs.module.scss";

interface TabsTypes {
  id: string;
  label: string;
  type: string;
}

interface TabsProps {
  tabs: TabsTypes[];
  onTabChange?: (tabId: string) => void;
  setOrderType?: (tabId: TabsTypes) => void;
}

const ToggleTabs: React.FC<TabsProps> = ({
  tabs,
  onTabChange,
  setOrderType,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabChange = (tab: TabsTypes) => {
    setActiveTab(tab.id);
    setOrderType?.(tab);

    if (onTabChange) {
      onTabChange(tab.id);
    }
  };

  // Рассчитываем позицию для span (активная вкладка)
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const spanWidth = 100 / tabs.length;
  const spanOffset = activeIndex * spanWidth;

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? styles.active : ""}
            onClick={() => handleTabChange(tab)}>
            {tab.label}
          </button>
        ))}
        <span
          style={{
            width: `${spanWidth}%`,
            left: `${spanOffset}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ToggleTabs;
