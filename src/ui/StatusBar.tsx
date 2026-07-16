import {
  getGravitySimulationPreset,
  getWindDescriptor,
} from "../physics/SandboxSimulation";
import { AppConfig } from "../config/AppConfig";
import { SimulationConfig } from "../config/SimulationConfig";
import { useEditorStore } from "../store/editorStore";

export interface StatusBarProps {
  fps: number;
  staticObjectCount: number;
  dynamicObjectCount: number;
  selectedCount: number;
}

export function StatusBar({
  fps,
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
      <div className="status-bar-pill">
        <div className="status-bar-group">
          <span className="status-bar-group-label">Objects</span>
          <span className="status-bar-value">Static {staticObjectCount}</span>
          <span className="status-bar-value">
            Dynamic {dynamicObjectCount}
          </span>
          <span className="status-bar-value">Selected {selectedCount}</span>
        </div>

        <div className="status-bar-divider" aria-hidden="true" />

        <div className="status-bar-group">
          <span className="status-bar-group-label">Modifiers</span>
          <span className="status-bar-value">
            Gravity: {isGravityReversed ? "Reverse " : ""}
            {activeGravityPreset.label}{" "}
            {activeGravityPreset.gravityMultiplier.toFixed(
              SimulationConfig.display.gravityDecimalPlaces,
            )}
            g
          </span>
          <span className="status-bar-value">
            Wind:{" "}
            {windDescriptor.direction
              ? `${windDescriptor.label} ${windDescriptor.direction} ${windDescriptor.strengthPercent.toFixed(
                  SimulationConfig.display.windDecimalPlaces,
                )}%`
              : windDescriptor.label}
          </span>
        </div>
      </div>

      <div className="status-bar-pill status-bar-fps">
        <span className="status-bar-group-label">FPS</span>
        <span className="status-bar-fps-value">{fps}</span>
      </div>

      <div className="status-bar-pill status-bar-copyright">
        <span>
          Copyright {AppConfig.portfolio.copyrightYear}{" "}
          {AppConfig.portfolio.copyrightOwner}
        </span>
      </div>
    </footer>
  );
}
