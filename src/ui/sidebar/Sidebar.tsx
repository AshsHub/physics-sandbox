import type { IApplication } from "../../application/IApplication";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { CreatorPanel } from "../panels/CreatorPanel";
import { InspectorPanel } from "../panels/InspectorPanel";
import { PrefabPanel } from "../panels/PrefabPanel";
import { SimulationPanel } from "../panels/SimulationPanel";
import { ThemeControl } from "../ThemeControl";
import { SidebarPanel } from "./SidebarPanel";

const sidebarTabs = [
  {
    label: "Creator",
    panel: SidebarPanel.Creator,
    tooltip: "Creator",
  },
  {
    label: "Inspector",
    panel: SidebarPanel.Inspector,
    tooltip: "Inspector",
  },
  {
    label: "Prefabs",
    panel: SidebarPanel.Prefabs,
    tooltip: "Prefabs",
  },
  {
    label: "Simulation",
    panel: SidebarPanel.Simulation,
    tooltip: "Simulation",
  },
] as const;

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
  const activeTabIndex = sidebarTabs.findIndex(
    ({ panel }) => panel === activePanel,
  );

  return (
    <aside className={hasActivePanel ? "sidebar" : "sidebar collapsed"}>
      <div className="sidebar-nav">
        <div className="sidebar-tabs">
          {activeTabIndex >= 0 && (
            <span
              className="sidebar-tab-indicator"
              style={{
                transform: `translateY(${activeTabIndex * 100}%)`,
              }}
            />
          )}

          {sidebarTabs.map(({ label, panel, tooltip }) => (
            <AppButton
              className={
                activePanel === panel
                  ? "sidebar-button selected"
                  : "sidebar-button"
              }
              data-tooltip={tooltip}
              data-tooltip-position="right"
              key={panel}
              onClick={() => setActivePanel(panel)}
              type="button"
            >
              <span className="sidebar-button-label">{label}</span>
            </AppButton>
          ))}
        </div>

        <div className="sidebar-footer">
          <ThemeControl />
        </div>
      </div>

      {hasActivePanel && (
        <div className="sidebar-content">
          {activePanel === SidebarPanel.Creator && (
            <CreatorPanel app={app} onClose={closePanel} />
          )}
          {activePanel === SidebarPanel.Inspector && (
            <InspectorPanel
              app={app}
              onClose={closePanel}
              onObjectContextMenu={onObjectContextMenu}
            />
          )}
          {activePanel === SidebarPanel.Prefabs && (
            <PrefabPanel app={app} onClose={closePanel} />
          )}
          {activePanel === SidebarPanel.Simulation && (
            <SimulationPanel onClose={closePanel} />
          )}
        </div>
      )}
    </aside>
  );
}
