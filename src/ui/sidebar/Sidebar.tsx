import { useRef, useState, type KeyboardEvent } from "react";
import type { IApplication } from "../../application/IApplication";
import type { VectorLike } from "../../maths/Vector2";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { getFocusableElements } from "../focusUtils";
import { AppIcon } from "../icons/AppIcon";
import { AboutPanel } from "../panels/AboutPanel";
import { CreatorPanel } from "../panels/CreatorPanel";
import { InspectorPanel } from "../panels/InspectorPanel";
import { PrefabPanel } from "../panels/PrefabPanel";
import { SimulationPanel } from "../panels/SimulationPanel";
import { ShortcutsDialog } from "../ShortcutsDialog";
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
  {
    label: "About",
    panel: SidebarPanel.About,
    tooltip: "About",
  },
] as const;

export interface SidebarProps {
  app: IApplication;
  onObjectContextMenu: (objectId: string, position: VectorLike) => void;
}

export function Sidebar({ app, onObjectContextMenu }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isShortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);
  const closePanel = () => setActivePanel(undefined);
  const hasActivePanel = activePanel !== undefined;
  const activeTabIndex = sidebarTabs.findIndex(
    ({ panel }) => panel === activePanel,
  );
  const focusSidebarTab = (index: number) => {
    const sidebarTab = sidebarRef.current?.querySelector<HTMLButtonElement>(
      `[data-sidebar-tab-index="${index}"]`,
    );

    sidebarTab?.focus();
  };

  const focusNextSidebarTab = () => {
    if (activeTabIndex < 0) {
      return;
    }

    focusSidebarTab((activeTabIndex + 1) % sidebarTabs.length);
  };

  const focusFirstPanelControl = () => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      focusNextSidebarTab();
      return;
    }

    const [firstFocusableElement] = getFocusableElements(contentElement);

    if (!firstFocusableElement) {
      focusNextSidebarTab();
      return;
    }

    firstFocusableElement.focus();
  };

  const handleSidebarTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    panel: SidebarPanel,
  ) => {
    if (event.key !== "Tab" || event.shiftKey || activePanel !== panel) {
      return;
    }

    event.preventDefault();
    focusFirstPanelControl();
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const contentElement = contentRef.current;

    if (!contentElement) {
      return;
    }

    const focusableElements = getFocusableElements(contentElement);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusableElement) {
      event.preventDefault();
      focusSidebarTab(activeTabIndex);
      return;
    }

    if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      event.preventDefault();
      focusNextSidebarTab();
    }
  };

  return (
    <aside
      aria-label="Editor panels"
      className={hasActivePanel ? "sidebar" : "sidebar collapsed"}
      ref={sidebarRef}
    >
      <div className="sidebar-nav">
        <div className="sidebar-tabs" role="group" aria-label="Editor panels">
          {activeTabIndex >= 0 && (
            <span
              className="sidebar-tab-indicator"
              style={{
                transform: `translateY(${activeTabIndex * 100}%)`,
              }}
            />
          )}

          {sidebarTabs.map(({ label, panel, tooltip }, index) => (
            <AppButton
              aria-pressed={activePanel === panel}
              className={
                activePanel === panel
                  ? "sidebar-button selected"
                  : "sidebar-button"
              }
              data-tooltip={tooltip}
              data-tooltip-position="right"
              data-sidebar-tab-index={index}
              key={panel}
              onKeyDown={(event) => handleSidebarTabKeyDown(event, panel)}
              onClick={() => setActivePanel(panel)}
              type="button"
            >
              <span className="sidebar-button-label">{label}</span>
            </AppButton>
          ))}
        </div>

        <div className="sidebar-footer">
          <AppButton
            aria-label="Keyboard shortcuts"
            className="sidebar-footer-button"
            data-tooltip="Keyboard shortcuts"
            data-tooltip-position="right"
            onClick={() => setShortcutsDialogOpen(true)}
            type="button"
            variant="icon"
          >
            <AppIcon name="shortcuts" />
          </AppButton>
          <ThemeControl />
        </div>
      </div>

      {hasActivePanel && (
        <div
          className="sidebar-content"
          ref={contentRef}
          onKeyDown={handlePanelKeyDown}
        >
          {activePanel === SidebarPanel.About && (
            <AboutPanel onClose={closePanel} />
          )}
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

      {isShortcutsDialogOpen && (
        <ShortcutsDialog onClose={() => setShortcutsDialogOpen(false)} />
      )}
    </aside>
  );
}
