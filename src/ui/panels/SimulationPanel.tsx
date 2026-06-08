import {
  gravitySimulationPresets,
  GravitySimulationType,
  WIND_FORCE_MAX,
  WIND_FORCE_MIN,
  WIND_FORCE_STEP,
} from "../../physics/SandboxSimulation";
import { useEditorStore } from "../../store/editorStore";
import { Panel } from "./Panel";

export interface SimulationPanelProps {
  onClose?: () => void;
}

export function SimluationPanel({ onClose }: SimulationPanelProps) {
  const activeGravitySimulation = useEditorStore(
    (s) => s.activeGravitySimulation,
  );
  const windForce = useEditorStore((s) => s.windForce);
  const setGravitySimulation = useEditorStore((s) => s.setGravitySimulation);
  const setWindForce = useEditorStore((s) => s.setWindForce);
  const activeGravityIndex = Math.max(
    0,
    gravitySimulationPresets.findIndex(
      (preset) => preset.type === activeGravitySimulation,
    ),
  );
  const activeGravityPreset = gravitySimulationPresets[activeGravityIndex];
  const windStrengthPercent =
    Math.round((windForce / WIND_FORCE_MAX) * 1000) / 10;

  return (
    <Panel title="Simulation" onClose={onClose}>
      <section className="simulation-group">
        <div className="simulation-control-header">
          <h3 className="simulation-group-title">Gravity</h3>
          <button
            className="simulation-reset-button"
            onClick={() => setGravitySimulation(GravitySimulationType.Earth)}
            type="button"
          >
            Reset
          </button>
        </div>

        <div className="simulation-slider-value">
          <span className="simulation-slider-name">
            {activeGravityPreset.label}
          </span>
          <span className="simulation-slider-meta">
            {activeGravityPreset.gravityMultiplier.toFixed(2)}g
          </span>
        </div>

        <input
          aria-label="Gravity modifier"
          className="simulation-slider"
          max={gravitySimulationPresets.length - 1}
          min={0}
          onChange={(event) => {
            const preset =
              gravitySimulationPresets[Number(event.currentTarget.value)];

            setGravitySimulation(preset.type);
          }}
          step={1}
          type="range"
          value={activeGravityIndex}
        />

        <div className="simulation-slider-range-labels">
          <span>None</span>
          <span>Sun</span>
        </div>
      </section>

      <section className="simulation-group">
        <div className="simulation-control-header">
          <h3 className="simulation-group-title">Wind</h3>
          <button
            className="simulation-reset-button"
            onClick={() => setWindForce(0)}
            type="button"
          >
            Reset
          </button>
        </div>

        <div className="simulation-slider-value">
          <span className="simulation-slider-name">
            {windForce < 0
              ? "Left Wind"
              : windForce > 0
                ? "Right Wind"
                : "None"}
          </span>
          <span className="simulation-slider-meta">
            {windStrengthPercent.toFixed(1)}%
          </span>
        </div>

        <input
          aria-label="Wind force"
          className="simulation-slider"
          max={WIND_FORCE_MAX}
          min={WIND_FORCE_MIN}
          onChange={(event) => setWindForce(Number(event.currentTarget.value))}
          step={WIND_FORCE_STEP}
          type="range"
          value={windForce}
        />

        <div className="simulation-slider-range-labels">
          <span>Left</span>
          <span>Right</span>
        </div>
      </section>
    </Panel>
  );
}
