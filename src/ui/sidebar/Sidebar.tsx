import type { IApplication } from "../../application/IApplication";
import { useEditorStore } from "../../store/editorStore";
import { CreatorPanel } from "../panels/CreatorPanel";
import { InspectorPanel } from "../panels/InspectorPanel";
import { SidebarPanel } from "../panels/SidebarPanel";
import { SimulationPanel } from "../panels/SimulationPanel";

export interface SidebarProps {
  app: IApplication;
  onObjectContextMenu: (
    objectId: string,
    position: { x: number; y: number },
  ) => void;
}

export function Sidebar({ app, onObjectContextMenu }: SidebarProps) {
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
          data-tooltip="Creator"
          data-tooltip-position="right"
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
          data-tooltip="Inspector"
          data-tooltip-position="right"
          onClick={() => setActivePanel(SidebarPanel.Inspector)}
        >
          I
        </button>

        <button
          className={
            activePanel === SidebarPanel.Simulation
              ? "sidebar-button selected"
              : "sidebar-button"
          }
          data-tooltip="Simulation"
          data-tooltip-position="right"
          onClick={() => setActivePanel(SidebarPanel.Simulation)}
        >
          S
        </button>
      </div>

      {hasActivePanel && (
        <div className="sidebar-content">
          {activePanel === SidebarPanel.Create && (
            <CreatorPanel app={app} onClose={closePanel} />
          )}
          {activePanel === SidebarPanel.Inspector && (
            <InspectorPanel
              app={app}
              onClose={closePanel}
              onObjectContextMenu={onObjectContextMenu}
            />
          )}
          {activePanel === SidebarPanel.Simulation && (
            <SimulationPanel onClose={closePanel} />
          )}
        </div>
      )}
    </aside>
  );
}
