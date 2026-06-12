import { useEffect, useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { InfoStack } from "../common/InfoStack";
import { AppIcon } from "../icons/AppIcon";
import { Panel } from "./Panel";

export interface AboutPanelProps {
  onClose?: () => void;
}

const demoSource = "/demos";

const featureGroups = [
  {
    gifPath: `${demoSource}/canvas-physics.gif`,
    label: "Stack",
    title: "Canvas physics loop",
    text: "React owns the editor shell, while a custom canvas renderer draws Matter.js bodies every frame.",
  },
  {
    gifPath: `${demoSource}/commands-history.gif`,
    label: "Workflow",
    text: "Create, edit, delete, paste, and prefab actions run through commands with undo and redo support.",
    title: "Command-based editing",
  },
  {
    gifPath: `${demoSource}/prefab-scenes.gif`,
    label: "Scenes",
    title: "Prefab scenes",
    text: "Reusable sandbox arrangements demonstrate collision chains, force fields, structures, and orbital layouts.",
  },
  {
    gifPath: `${demoSource}/simulation-modifiers.gif`,
    label: "World",
    title: "Simulation modifiers",
    text: "Gravity, wind, play state, and object forces can reshape how the world behaves.",
  },
  {
    gifPath: `${demoSource}/inspector-editing.gif`,
    label: "Data",
    title: "Inspector editing",
    text: "Objects expose visual, physics, and read-only metadata for direct editing.",
  },
  {
    gifPath: `${demoSource}/interaction-tools.gif`,
    label: "Tools",
    title: "Interaction tools",
    text: "Selection, context menus, clipboard actions, object stamping, camera controls, and fit view support fast scene work.",
  },
] as const;

const projectStats = [
  "React UI",
  "Canvas renderer",
  "Matter.js physics",
  "Command history",
  "Prefab exporter (Dev Only)",
] as const;

type FeatureGroup = (typeof featureGroups)[number];

export function AboutPanel({ onClose }: AboutPanelProps) {
  const [selectedFeature, setSelectedFeature] = useState<FeatureGroup>();

  useEffect(() => {
    if (!selectedFeature) {
      return;
    }

    const previousIsSimulationRunning =
      useEditorStore.getState().isSimulationRunning;

    useEditorStore.getState().setKeyboardInputSuspended(true);
    useEditorStore.getState().setSimulationRunning(false);

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        setSelectedFeature(undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      useEditorStore.getState().setKeyboardInputSuspended(false);

      if (previousIsSimulationRunning) {
        useEditorStore.getState().setSimulationRunning(true);
      }
    };
  }, [selectedFeature]);

  return (
    <Panel title="About" onClose={onClose}>
      <section className="about-panel">
        <article className="about-card about-intro">
          <div className="about-intro-heading">
            <span className="about-kicker">Portfolio project</span>
            <InfoStack
              className="about-intro-copy"
              description="A portfolio project exploring React, canvas rendering, and Matter.js physics as an interactive editor."
              title="Physics Sandbox"
            />
          </div>

          <div className="about-chip-list" aria-label="Project stack">
            {projectStats.map((stat) => (
              <span className="about-chip" key={stat}>
                {stat}
              </span>
            ))}
          </div>
        </article>

        <div className="about-feature-list">
          {featureGroups.map((feature) => (
            <AppButton
              className="about-card about-feature-button"
              data-tooltip={`Open ${feature.title} demo`}
              data-tooltip-position="right"
              key={feature.title}
              onClick={() => setSelectedFeature(feature)}
              type="button"
              variant="ghost"
            >
              <div className="about-feature-heading">
                <span className="about-feature-label">{feature.label}</span>
                <InfoStack
                  className="about-feature-copy"
                  description={feature.text}
                  title={feature.title}
                />
              </div>
            </AppButton>
          ))}
        </div>
      </section>

      {selectedFeature && (
        <div
          aria-labelledby="about-demo-title"
          aria-modal="true"
          className="about-dialog-overlay"
          role="dialog"
          onMouseDown={() => setSelectedFeature(undefined)}
        >
          <div
            className="about-dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="about-dialog-header">
              <div className="about-dialog-heading">
                <span className="about-kicker">{selectedFeature.label}</span>
                <InfoStack
                  className="about-dialog-copy"
                  description={selectedFeature.text}
                  title={
                    <span id="about-demo-title">{selectedFeature.title}</span>
                  }
                />
              </div>

              <AppButton
                aria-label="Close demo dialog"
                className="about-dialog-close"
                data-tooltip="Close"
                data-tooltip-position="left"
                onClick={() => setSelectedFeature(undefined)}
                type="button"
                variant="icon"
              >
                <AppIcon name="close" />
              </AppButton>
            </div>

            <div className="about-dialog-media">
              <img
                alt={`${selectedFeature.title} demo`}
                src={selectedFeature.gifPath}
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
              <div className="about-dialog-media-placeholder">
                <span>GIF demo</span>
                <code>{selectedFeature.gifPath}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
