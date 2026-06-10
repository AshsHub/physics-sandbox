import { SimulationConfig } from "../../config/SimulationConfig";
import {
  getWindDescriptor,
  gravitySimulationPresets,
  GravitySimulationType,
} from "../../physics/SandboxSimulation";
import { useEditorStore } from "../../store/editorStore";
import { Panel } from "./Panel";

export interface SimulationPanelProps {
  onClose?: () => void;
}

export function SimulationPanel({ onClose }: SimulationPanelProps) {
  const activeGravitySimulation = useEditorStore(
    (s) => s.activeGravitySimulation,
  );
  const isGravityReversed = useEditorStore((s) => s.isGravityReversed);
  const windForce = useEditorStore((s) => s.windForce);
  const setGravitySimulation = useEditorStore((s) => s.setGravitySimulation);
  const setGravityReversed = useEditorStore((s) => s.setGravityReversed);
  const setWindForce = useEditorStore((s) => s.setWindForce);
  const activeGravityIndex = Math.max(
    0,
    gravitySimulationPresets.findIndex(
      (preset) => preset.type === activeGravitySimulation,
    ),
  );
  const activeGravityPreset = gravitySimulationPresets[activeGravityIndex];
  const windDescriptor = getWindDescriptor(windForce);

  return (
    <Panel title="Simulation" onClose={onClose}>
      <section className="simulation-group">
        <div className="simulation-control-header">
          <h3 className="simulation-group-title">Gravity</h3>
          <div className="simulation-control-actions">
            <button
              aria-pressed={isGravityReversed}
              className={
                isGravityReversed
                  ? "simulation-reset-button selected"
                  : "simulation-reset-button"
              }
              data-tooltip="Invert gravity direction"
              data-tooltip-position="bottom"
              onClick={() => setGravityReversed(!isGravityReversed)}
              type="button"
            >
              Reverse
            </button>
            <button
              className="simulation-reset-button"
              data-tooltip="Reset gravity to Earth"
              data-tooltip-position="left"
              onClick={() => {
                setGravitySimulation(GravitySimulationType.Earth);
                setGravityReversed(false);
              }}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="simulation-slider-value">
          <span className="simulation-slider-name">
            {activeGravityPreset.label}
          </span>
          <span className="simulation-slider-meta">
            {activeGravityPreset.gravityMultiplier.toFixed(
              SimulationConfig.display.gravityDecimalPlaces,
            )}
            g
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
          step={SimulationConfig.gravity.sliderStep}
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
            data-tooltip="Remove wind force"
            data-tooltip-position="left"
            onClick={() => setWindForce(SimulationConfig.wind.defaultWindForce)}
            type="button"
          >
            Reset
          </button>
        </div>

        <div className="simulation-slider-value">
          <span className="simulation-slider-name">
            {windDescriptor.direction
              ? `${windDescriptor.label} ${windDescriptor.direction}`
              : windDescriptor.label}
          </span>
          <span className="simulation-slider-meta">
            {windDescriptor.strengthPercent.toFixed(
              SimulationConfig.display.windDecimalPlaces,
            )}
            %
          </span>
        </div>

        <input
          aria-label="Wind force"
          className="simulation-slider"
          max={SimulationConfig.wind.maxForce}
          min={SimulationConfig.wind.minForce}
          onChange={(event) => setWindForce(Number(event.currentTarget.value))}
          step={SimulationConfig.wind.step}
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
