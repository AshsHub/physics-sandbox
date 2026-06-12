import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";
import { AppButton } from "./common/AppButton";
import { AppIcon, type AppIconName } from "./icons/AppIcon";

const modes = [
  {
    icon: "play",
    label: "Play",
    mode: InteractionMode.Play,
    shortcut: 1,
  },
  {
    icon: "selection",
    label: "Select",
    mode: InteractionMode.Selection,
    shortcut: 2,
  },
  {
    icon: "camera",
    label: "Camera",
    mode: InteractionMode.Camera,
    shortcut: 3,
  },
] satisfies {
  icon: AppIconName;
  label: string;
  mode: InteractionMode;
  shortcut: number;
}[];

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
        {modes.map(({ icon, label, mode, shortcut }) => (
          <AppButton
            aria-pressed={interactionMode === mode}
            className={
              interactionMode === mode
                ? "interaction-mode-button selected"
                : "interaction-mode-button"
            }
            key={mode}
            onClick={() => setInteractionMode(mode)}
            data-tooltip={`${label} mode (${shortcut})`}
            data-tooltip-position="bottom"
            type="button"
            variant={interactionMode === mode ? "accent" : "default"}
          >
            <AppIcon className="interaction-mode-icon" name={icon} />
            {label}
          </AppButton>
        ))}
      </div>

      <AppButton
        aria-pressed={showForceRadius}
        className={
          showForceRadius
            ? "toolbar-toggle-button selected"
            : "toolbar-toggle-button"
        }
        data-tooltip={
          showForceRadius
            ? "Hide force radius overlays (R)"
            : "Show force radius overlays (R)"
        }
        data-tooltip-position="bottom"
        onClick={() => setShowForceRadius(!showForceRadius)}
        type="button"
        variant={showForceRadius ? "accent" : "default"}
      >
        Force Radius
      </AppButton>

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

        <AppButton
          aria-pressed={!isSimulationRunning}
          className="simulation-control-button"
          disabled={!isSimulationRunning}
          onClick={() => setSimulationRunning(false)}
          type="button"
          variant="ghost"
        >
          <AppIcon name="pause" />
        </AppButton>

        <AppButton
          aria-pressed={isSimulationRunning}
          className="simulation-control-button"
          disabled={isSimulationRunning}
          onClick={() => setSimulationRunning(true)}
          type="button"
          variant="ghost"
        >
          <AppIcon name="play" />
        </AppButton>
      </div>
    </header>
  );
}
