import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";

export interface ToolbarProps {
  onFitView: () => void;
}

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

export function Toolbar({ onFitView }: ToolbarProps) {
  const interactionMode = useEditorStore((s) => s.interactionMode);
  const setInteractionMode = useEditorStore((s) => s.setInteractionMode);
  const cameraZoom = useEditorStore((s) => s.cameraZoom);
  const isSimulationRunning = useEditorStore((s) => s.isSimulationRunning);
  const setSimulationRunning = useEditorStore((s) => s.setSimulationRunning);

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
            title={`${label} (${input})`}
            type="button"
          >
            <span className="interaction-mode-key">{input}</span>
            {label}
          </button>
        ))}
      </div>

      <button
        className="fit-view-button"
        onClick={onFitView}
        title="Fit objects to view"
        type="button"
      >
        Fit {Math.round(cameraZoom * 100)}%
      </button>

      <div className="simulation-controls" aria-label="Simulation controls">
        <span
          className={
            isSimulationRunning
              ? "simulation-control-indicator right"
              : "simulation-control-indicator left"
          }
        />

        <button
          aria-pressed={isSimulationRunning}
          className="simulation-control-button"
          onClick={() => setSimulationRunning(!isSimulationRunning)}
          title="Pause simulation"
          type="button"
        >
          ||
        </button>

        <button
          aria-pressed={!isSimulationRunning}
          className="simulation-control-button"
          onClick={() => setSimulationRunning(!isSimulationRunning)}
          title="Play simulation"
          type="button"
        >
          {">"}
        </button>
      </div>
    </header>
  );
}
