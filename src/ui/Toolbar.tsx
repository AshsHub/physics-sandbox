import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";

const modes = [
  {
    label: "Select",
    mode: InteractionMode.Selection,
    input: 1,
  },
  {
    label: "Camera",
    mode: InteractionMode.Camera,
    input: 2,
  },
  {
    label: "Play",
    mode: InteractionMode.Play,
    input: 3,
  },
];

export function Toolbar() {
  const interactionMode = useEditorStore((s) => s.interactionMode);
  const setInteractionMode = useEditorStore((s) => s.setInteractionMode);

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
            title={`${label} (input)`}
            type="button"
          >
            <span className="interaction-mode-key">{input}</span>
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
