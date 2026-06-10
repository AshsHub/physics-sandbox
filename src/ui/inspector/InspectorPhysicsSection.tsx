import { SandboxObjectConfig } from "../../config/SandboxObjectConfig";
import {
  SandboxObjectRadialForceMode,
  type ISandboxObjectMetadata,
} from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";
import { EditableNumber, EditableSelect, ReadOnlyRow } from "./InspectorFields";
import { InspectorSection } from "./InspectorSection";

export interface InspectorPhysicsSectionProps {
  flags: SandboxObjectFlags;
  metadata: ISandboxObjectMetadata;
  onUpdateFlags: (flags: SandboxObjectFlags) => void;
  onUpdateMetadata: (partial: Partial<ISandboxObjectMetadata>) => void;
}

export function InspectorPhysicsSection({
  flags,
  metadata,
  onUpdateFlags,
  onUpdateMetadata,
}: InspectorPhysicsSectionProps) {
  const constraints = SandboxObjectConfig.metadataConstraints;
  const isStatic = (flags & SandboxObjectFlags.Static) !== 0;

  return (
    <InspectorSection title="Physics">
      <EditableSelect
        label="State"
        value={isStatic ? "Static" : "Dynamic"}
        options={["Static", "Dynamic"]}
        onCommit={(state) => {
          const nextIsStatic = state === "Static";
          const nextFlags = nextIsStatic
            ? flags | SandboxObjectFlags.Static
            : flags & ~SandboxObjectFlags.Static;

          onUpdateFlags(nextFlags);

          if (!nextIsStatic && metadata.mass <= 0) {
            onUpdateMetadata({
              mass: constraints.mass.fallbackDynamicValue,
            });
          }
        }}
      />
      {isStatic ? (
        <ReadOnlyRow label="Mass" value="Static" />
      ) : (
        <EditableNumber
          key={`mass:${metadata.mass}`}
          label="Mass"
          min={constraints.mass.min}
          step={constraints.mass.step}
          value={metadata.mass}
          onCommit={(mass) => onUpdateMetadata({ mass })}
        />
      )}
      <EditableNumber
        key={`bounce:${metadata.bounce}`}
        label="Bounce"
        max={constraints.bounce.max}
        min={constraints.bounce.min}
        step={constraints.bounce.step}
        value={metadata.bounce}
        onCommit={(bounce) => onUpdateMetadata({ bounce })}
      />
      <EditableNumber
        key={`friction:${metadata.friction}`}
        label="Friction"
        max={constraints.friction.max}
        min={constraints.friction.min}
        step={constraints.friction.step}
        value={metadata.friction}
        onCommit={(friction) => onUpdateMetadata({ friction })}
      />
      <EditableSelect
        label="Force"
        value={metadata.radialForceMode}
        options={Object.values(SandboxObjectRadialForceMode)}
        onCommit={(radialForceMode) => onUpdateMetadata({ radialForceMode })}
      />
      {metadata.radialForceMode !== SandboxObjectRadialForceMode.None && (
        <>
          <EditableNumber
            key={`radialForceRadius:${metadata.radialForceRadius}`}
            label="Radius"
            min={constraints.radialForceRadius.min}
            step={constraints.radialForceRadius.step}
            value={metadata.radialForceRadius}
            onCommit={(radialForceRadius) =>
              onUpdateMetadata({ radialForceRadius })
            }
          />
          <EditableNumber
            key={`radialForceStrength:${metadata.radialForceStrength}`}
            label="Strength"
            min={constraints.radialForceStrength.min}
            step={constraints.radialForceStrength.step}
            value={metadata.radialForceStrength}
            onCommit={(radialForceStrength) =>
              onUpdateMetadata({ radialForceStrength })
            }
          />
        </>
      )}
    </InspectorSection>
  );
}
