import { SimulationConfig } from "../../config/SimulationConfig";
import {
  getWindDescriptor,
  gravitySimulationPresets,
  GravitySimulationType,
} from "../../physics/SandboxSimulation";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { InfoStack } from "../common/InfoStack";
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
  const canResetGravity =
    activeGravitySimulation !== GravitySimulationType.Earth ||
    isGravityReversed;
  const canResetWind = windForce !== SimulationConfig.wind.defaultWindForce;
  const gravityDirectionLabel = isGravityReversed
    ? "Upward force"
    : "Downward force";
  const windLabel = windDescriptor.direction
    ? `${windDescriptor.label} ${windDescriptor.direction}`
    : windDescriptor.label;
  const windDescription = windDescriptor.direction
    ? `${windDescriptor.direction} facing force`
    : "No horizontal force";

  return (
    <Panel title="Simulation" onClose={onClose}>
      <section className="simulation-group">
        <div className="simulation-control-header">
          <h3 className="simulation-group-title">Gravity</h3>
          <div className="simulation-control-actions">
            <AppButton
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
              variant={isGravityReversed ? "accent" : "default"}
            >
              Reverse
            </AppButton>
            <AppButton
              className="simulation-reset-button"
              data-tooltip="Reset gravity to Earth"
              data-tooltip-position="left"
              disabled={!canResetGravity}
              onClick={() => {
                setGravitySimulation(GravitySimulationType.Earth);
                setGravityReversed(false);
              }}
              type="button"
              variant="default"
            >
              Reset
            </AppButton>
          </div>
        </div>

        <div className="simulation-slider-value">
          <InfoStack
            className="simulation-slider-copy"
            description={gravityDirectionLabel}
            title={activeGravityPreset.label}
          />
          <span className="simulation-slider-meta">
            {activeGravityPreset.gravityMultiplier.toFixed(
              SimulationConfig.display.gravityDecimalPlaces,
            )}
            g
          </span>
        </div>

        <input
          aria-label="Gravity modifier"
          className="app-range simulation-slider"
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
          <AppButton
            className="simulation-reset-button"
            data-tooltip="Remove wind force"
            data-tooltip-position="left"
            disabled={!canResetWind}
            onClick={() => setWindForce(SimulationConfig.wind.defaultWindForce)}
            type="button"
            variant="default"
          >
            Reset
          </AppButton>
        </div>

        <div className="simulation-slider-value">
          <InfoStack
            className="simulation-slider-copy"
            description={windDescription}
            title={windLabel}
          />
          <span className="simulation-slider-meta">
            {windDescriptor.strengthPercent.toFixed(
              SimulationConfig.display.windDecimalPlaces,
            )}
            %
          </span>
        </div>

        <input
          aria-label="Wind force"
          className="app-range simulation-slider"
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
