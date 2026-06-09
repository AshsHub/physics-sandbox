import {
  getGravitySimulationPreset,
  getWindDescriptor,
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
  const isGravityReversed = useEditorStore((s) => s.isGravityReversed);
  const windForce = useEditorStore((s) => s.windForce);
  const activeGravityPreset = getGravitySimulationPreset(
    activeGravitySimulation,
  );
  const windDescriptor = getWindDescriptor(windForce);

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
          Gravity: {isGravityReversed ? "Reverse " : ""}
          {activeGravityPreset.label}{" "}
          {activeGravityPreset.gravityMultiplier.toFixed(2)}g
        </span>
        <span>
          Wind:{" "}
          {windDescriptor.direction
            ? `${windDescriptor.label} ${windDescriptor.direction} ${windDescriptor.strengthPercent.toFixed(1)}%`
            : windDescriptor.label}
        </span>
      </div>
    </footer>
  );
}
