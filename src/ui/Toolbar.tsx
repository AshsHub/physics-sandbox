import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";

const modes = [
  {
    label: "Select",
    mode: InteractionMode.Selection,
  },
  {
    label: "Camera",
    mode: InteractionMode.Camera,
  },
  {
    label: "Play",
    mode: InteractionMode.Play,
  },
];

export function Toolbar() {
  const interactionMode = useEditorStore((s) => s.interactionMode);
  const setInteractionMode = useEditorStore((s) => s.setInteractionMode);

  return (
    <header className="toolbar">
      <h1 className="toolbar-title">Physics Sandbox</h1>

      <div className="interaction-mode-controls" aria-label="Interaction mode">
        {modes.map(({ label, mode }, index) => (
          <button
            aria-pressed={interactionMode === mode}
            className={
              interactionMode === mode
                ? "interaction-mode-button selected"
                : "interaction-mode-button"
            }
            key={mode}
            onClick={() => setInteractionMode(mode)}
            title={`${label} (${index + 1})`}
            type="button"
          >
            <span className="interaction-mode-key">{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
