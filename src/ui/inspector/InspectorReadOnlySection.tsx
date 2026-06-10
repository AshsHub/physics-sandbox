import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";
import { ReadOnlyRow } from "./InspectorFields";
import { InspectorSection } from "./InspectorSection";

export interface InspectorReadOnlySectionProps {
  entity: ISandboxObject;
  isSelected: boolean;
}

export function InspectorReadOnlySection({
  entity,
  isSelected,
}: InspectorReadOnlySectionProps) {
  const isStatic = (entity.flags & SandboxObjectFlags.Static) !== 0;
  const isLocked = (entity.flags & SandboxObjectFlags.Locked) !== 0;
  const isHidden = (entity.flags & SandboxObjectFlags.Hidden) !== 0;

  return (
    <InspectorSection title="Read-only">
      <ReadOnlyRow label="Type" value={entity.type} />
      <ReadOnlyRow label="Visible" value={isHidden ? "Hidden" : "Visible"} />
      <ReadOnlyRow label="State" value={isStatic ? "Static" : "Dynamic"} />
      <ReadOnlyRow label="Locked" value={isLocked ? "Yes" : "No"} />
      <ReadOnlyRow label="Selected" value={isSelected ? "Yes" : "No"} />
      <ReadOnlyRow label="ID" value={entity.id} />
    </InspectorSection>
  );
}
