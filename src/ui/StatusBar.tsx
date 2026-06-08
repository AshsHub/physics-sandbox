import {
  getGravitySimulationPreset,
  WIND_FORCE_MAX,
} from "../physics/SandboxSimulation";
import { useEditorStore } from "../store/editorStore";

export interface StatusBarProps {
  staticObjectCount: number;
  dynamicObjectCount: number;
  selectedCount: number;
}

export function StatusBar({
  staticObjectCount,
  dynamicObjectCount,
  selectedCount,
}: StatusBarProps) {
  const activeGravitySimulation = useEditorStore(
    (s) => s.activeGravitySimulation,
  );
  const windForce = useEditorStore((s) => s.windForce);
  const activeGravityPreset = getGravitySimulationPreset(
    activeGravitySimulation,
  );
  const windLabel = windForce < 0 ? "Left" : windForce > 0 ? "Right" : "None";
  const windStrengthPercent =
    Math.round((Math.abs(windForce) / WIND_FORCE_MAX) * 1000) / 10;

  return (
    <footer className="status-bar">
      <div className="status-bar-group">
        <span className="status-bar-group-label">Objects</span>
        <span>Static: {staticObjectCount}</span>
        <span>Dynamic: {dynamicObjectCount}</span>
        <span>Selected: {selectedCount}</span>
      </div>

      <div className="status-bar-divider" aria-hidden="true" />

      <div className="status-bar-group">
        <span className="status-bar-group-label">Modifiers</span>
        <span>
          Gravity: {activeGravityPreset.label}{" "}
          {activeGravityPreset.gravityMultiplier.toFixed(2)}g
        </span>
        <span>
          Wind: {windLabel}
          {windForce !== 0 ? ` ${windStrengthPercent.toFixed(1)}%` : ""}
        </span>
      </div>
    </footer>
  );
}
