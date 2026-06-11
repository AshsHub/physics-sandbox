import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";

const modes = [
  {
    label: "Play",
    mode: InteractionMode.Play,
    input: 1,
  },
  {
    label: "Select",
    mode: InteractionMode.Selection,
    input: 2,
  },
  {
    label: "Camera",
    mode: InteractionMode.Camera,
    input: 3,
  },
];

export function Toolbar() {
  const interactionMode = useEditorStore((s) => s.interactionMode);
  const setInteractionMode = useEditorStore((s) => s.setInteractionMode);
  const isSimulationRunning = useEditorStore((s) => s.isSimulationRunning);
  const setSimulationRunning = useEditorStore((s) => s.setSimulationRunning);
  const showForceRadius = useEditorStore((s) => s.showForceRadius);
  const setShowForceRadius = useEditorStore((s) => s.setShowForceRadius);

  return (
    <header className="toolbar">
      <div className="interaction-mode-controls" aria-label="Interaction mode">
        {modes.map(({ label, mode, input }) => (
          <button
            aria-pressed={interactionMode === mode}
            className={
              interactionMode === mode
                ? "interaction-mode-button selected"
                : "interaction-mode-button"
            }
            key={mode}
            onClick={() => setInteractionMode(mode)}
            data-tooltip={`${label} mode (${input})`}
            data-tooltip-position="bottom"
            type="button"
          >
            <kbd className="interaction-mode-key">{input}</kbd>
            {label}
          </button>
        ))}
      </div>

      <button
        aria-pressed={showForceRadius}
        className={
          showForceRadius
            ? "toolbar-toggle-button selected"
            : "toolbar-toggle-button"
        }
        data-tooltip={
          showForceRadius
            ? "Hide force radius overlays (R)"
            : "Show force radius overlays"
        }
        data-tooltip-position="bottom"
        onClick={() => setShowForceRadius(!showForceRadius)}
        type="button"
      >
        Force Radius
      </button>

      <div
        className="simulation-controls"
        aria-label="Simulation controls"
        data-tooltip={
          isSimulationRunning
            ? "Pause simulation (Space)"
            : "Play simulation (Space)"
        }
        data-tooltip-position="bottom"
      >
        <span
          className={
            isSimulationRunning
              ? "simulation-control-indicator right"
              : "simulation-control-indicator left"
          }
        />

        <button
          aria-pressed={!isSimulationRunning}
          className="simulation-control-button"
          disabled={!isSimulationRunning}
          onClick={() => setSimulationRunning(false)}
          type="button"
        >
          ||
        </button>

        <button
          aria-pressed={isSimulationRunning}
          className="simulation-control-button"
          disabled={isSimulationRunning}
          onClick={() => setSimulationRunning(true)}
          type="button"
        >
          {">"}
        </button>
      </div>
    </header>
  );
}
