// Sidebar.tsx

import type { IApplication } from "../../abstractions/IApplication";
import { useEditorStore } from "../../store/editorStore";
import { CreatePanel } from "./CreatePanel";
import { InspectorPanel } from "./InspectorPanel";
import { SidebarPanel } from "./SidebarPanel";

export interface SidebarProps {
  app: IApplication;
}

export function Sidebar({ app }: SidebarProps) {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <button
          className={
            activePanel === SidebarPanel.Create
              ? "sidebar-button selected"
              : "sidebar-button"
          }
          onClick={() => setActivePanel(SidebarPanel.Create)}
        >
          +
        </button>

        <button
          className={
            activePanel === SidebarPanel.Inspector
              ? "sidebar-button selected"
              : "sidebar-button"
          }
          onClick={() => setActivePanel(SidebarPanel.Inspector)}
        >
          I
        </button>
      </div>

      <div className="sidebar-content">
        {activePanel === SidebarPanel.Create && <CreatePanel app={app} />}
        {activePanel === SidebarPanel.Inspector && <InspectorPanel app={app} />}
      </div>
    </aside>
  );
}
