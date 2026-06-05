import type { IApplication } from "../../application/IApplication";
import { useEditorStore } from "../../store/editorStore";
import { CreatePanel } from "../panels/CreatePanel";
import { InspectorPanel } from "../panels/InspectorPanel";
import { SidebarPanel } from "../panels/SidebarPanel";

export interface SidebarProps {
  app: IApplication;
}

export function Sidebar({ app }: SidebarProps) {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);
  const closePanel = () => setActivePanel(undefined);
  const hasActivePanel = activePanel !== undefined;

  return (
    <aside className={hasActivePanel ? "sidebar" : "sidebar collapsed"}>
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

      {hasActivePanel && (
        <div className="sidebar-content">
          {activePanel === SidebarPanel.Create && (
            <CreatePanel app={app} onClose={closePanel} />
          )}
          {activePanel === SidebarPanel.Inspector && (
            <InspectorPanel app={app} onClose={closePanel} />
          )}
        </div>
      )}
    </aside>
  );
}
