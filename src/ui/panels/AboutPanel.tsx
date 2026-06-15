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
    mediaPath: `${demoSource}/webm/canvas-physics-loop.webm`,
    detail:
      "React handles the panels, controls, and state, while the canvas renders the live Matter.js world directly. The result is an editor UI wrapped around a real-time physics scene.",
    label: "Stack",
    title: "Canvas physics loop",
    text: "React owns the editor shell, while a custom canvas renderer draws Matter.js bodies every frame.",
  },
  {
    mediaPath: `${demoSource}/webm/command-history.webm`,
    detail:
      "Object creation, deletion, metadata edits, clipboard actions, and prefab spawns all flow through the command system. Undo with Ctrl+Z or Command+Z; redo with Ctrl+Y, Ctrl+Shift+Z, or Command+Shift+Z.",
    label: "Workflow",
    text: "Create, edit, delete, paste, and prefab actions run through commands with undo and redo support.",
    title: "Command-based editing",
  },
  {
    mediaPath: `${demoSource}/webm/prefab-scenes.webm`,
    detail:
      "Prefabs are serialized object groups that drop into the world as a single action. They are useful for building portfolio-ready demos, stress tests, and reusable physics setups without rebuilding scenes by hand.",
    label: "Scenes",
    title: "Prefab scenes",
    text: "Reusable sandbox arrangements demonstrate collision chains, force fields, structures, and orbital layouts.",
  },
  {
    mediaPath: `${demoSource}/webm/simulation-modifiers.webm`,
    detail:
      "Gravity uses recognisable planet and star presets, including low gravity, heavy gravity, and reverse gravity. Wind stays fluid, so the same scene can shift from a light sideways drift to a stronger tunnel effect.",
    label: "World",
    title: "Simulation modifiers",
    text: "Gravity, wind, play state, and object forces can reshape how the world behaves.",
  },
  {
    mediaPath: `${demoSource}/webm/inspector-editing.webm`,
    detail:
      "The inspector edits both presentation and physics data: colour, size, mass, bounce, friction, force settings, and more. Changes are committed rather than streamed every frame, so editing stays compatible with command history.",
    label: "Data",
    title: "Inspector editing",
    text: "Objects expose visual, physics, and read-only metadata for direct editing.",
  },
  {
    mediaPath: `${demoSource}/webm/interaction-tools.webm`,
    detail:
      "The sandbox separates selection, movement, camera control, clipboard work, context menus, and stamp placement. That keeps common editor actions quick without turning right-click or keyboard shortcuts into overloaded controls.",
    label: "Tools",
    title: "Interaction tools",
    text: "Selection, context menus, clipboard actions, object stamping, camera controls, and fit view support fast scene work.",
  },
  {
    mediaPath: `${demoSource}/webm/object-forces.webm`,
    detail:
      "Any object can become a radial force source. Pull fields behave like local gravity wells, push fields act like repulsors, and the translucent radius makes the invisible influence readable while you build. The radius overlay can be toggled off when you want a cleaner scene.",
    label: "Forces",
    title: "Object forces",
    text: "Push and pull fields can be attached to objects, visualised in-world, and mixed with ordinary collision bodies.",
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
              <video
                aria-label={`${selectedFeature.title} demo`}
                autoPlay
                loop
                muted
                playsInline
                src={selectedFeature.mediaPath}
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
              <div className="about-dialog-media-placeholder">
                <span>WebM demo</span>
                <code>{selectedFeature.mediaPath}</code>
              </div>
            </div>

            {selectedFeature.detail && (
              <p className="about-dialog-detail">{selectedFeature.detail}</p>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
