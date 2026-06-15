import { SandboxObjectConfig } from "../../config/SandboxObjectConfig";
import {
  SandboxObjectBorderStyle,
  type ISandboxObjectMetadata,
} from "../../sandbox/SandboxObject";
import {
  EditableColor,
  EditableNumber,
  EditableSelect,
  EditableSize,
} from "./InspectorFields";
import { InspectorSection } from "./InspectorSection";

export interface InspectorVisualSectionProps {
  metadata: ISandboxObjectMetadata;
  onUpdateMetadata: (partial: Partial<ISandboxObjectMetadata>) => void;
}

export function InspectorVisualSection({
  metadata,
  onUpdateMetadata,
}: InspectorVisualSectionProps) {
  const constraints = SandboxObjectConfig.metadataConstraints;

  return (
    <InspectorSection title="Visual">
      <EditableSize
        aspectLocked={metadata.aspectLocked}
        height={metadata.height}
        key={`size:${metadata.width}:${metadata.height}:${metadata.aspectLocked}`}
        max={constraints.width.max}
        min={constraints.width.min}
        step={constraints.width.step}
        width={metadata.width}
        onCommit={(size) => onUpdateMetadata(size)}
      />
      <EditableColor
        key={`color:${metadata.color}`}
        label="Fill"
        value={metadata.color}
        onCommit={(color) => onUpdateMetadata({ color })}
      />
      <EditableNumber
        key={`opacity:${metadata.opacity}`}
        label="Opacity"
        max={constraints.opacity.max}
        min={constraints.opacity.min}
        step={constraints.opacity.step}
        value={metadata.opacity}
        onCommit={(opacity) => onUpdateMetadata({ opacity })}
      />
      <EditableColor
        key={`borderColor:${metadata.borderColor}`}
        label="Border"
        value={metadata.borderColor}
        onCommit={(borderColor) => onUpdateMetadata({ borderColor })}
      />
      <EditableNumber
        key={`borderWidth:${metadata.borderWidth}`}
        label="Border px"
        min={constraints.borderWidth.min}
        step={constraints.borderWidth.step}
        value={metadata.borderWidth}
        onCommit={(borderWidth) => onUpdateMetadata({ borderWidth })}
      />
      <EditableSelect
        label="Border style"
        value={metadata.borderStyle}
        options={Object.values(SandboxObjectBorderStyle)}
        onCommit={(borderStyle) => onUpdateMetadata({ borderStyle })}
      />
    </InspectorSection>
  );
}
