import { SandboxObjectConfig } from "../../config/SandboxObjectConfig";
import {
  SandboxObjectBorderStyle,
  type ISandboxObjectMetadata,
} from "../../sandbox/SandboxObject";
import { EditableColor, EditableNumber, EditableSelect } from "./InspectorFields";
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
      <EditableNumber
        key={`width:${metadata.width}`}
        label="Width"
        min={constraints.width.min}
        step={constraints.width.step}
        value={metadata.width}
        onCommit={(width) => onUpdateMetadata({ width })}
      />
      <EditableNumber
        key={`height:${metadata.height}`}
        label="Height"
        min={constraints.height.min}
        step={constraints.height.step}
        value={metadata.height}
        onCommit={(height) => onUpdateMetadata({ height })}
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
