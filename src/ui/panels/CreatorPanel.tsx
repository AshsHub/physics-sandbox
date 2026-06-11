// CreatePanel.tsx

import type { IApplication } from "../../application/IApplication";
import { SandboxObjectType } from "../../sandbox/SandboxObjectType";
import { useEditorStore } from "../../store/editorStore";
import {
  type CreatorShapeAction,
  dynamicShapes,
  staticShapes,
} from "../creatorShapes";
import { AppButton } from "../common/AppButton";
import { Panel } from "./Panel";

export interface CreatorPanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function CreatorPanel({ app, onClose }: CreatorPanelProps) {
  const activePlacementType = useEditorStore((s) => s.objectPlacement?.type);
  const createObject = (type: SandboxObjectType) => {
    app.startObjectPlacement(type);
  };

  return (
    <Panel title="Creator" onClose={onClose}>
      <CreatorGroup
        label="Dynamic"
        activeType={activePlacementType}
        shapes={dynamicShapes}
        onCreate={createObject}
      />

      <CreatorGroup
        label="Static"
        activeType={activePlacementType}
        shapes={staticShapes}
        onCreate={createObject}
      />
    </Panel>
  );
}

interface CreatorGroupProps {
  activeType?: SandboxObjectType;
  label: string;
  shapes: CreatorShapeAction[];
  onCreate: (type: SandboxObjectType) => void;
}

function CreatorGroup({
  activeType,
  label,
  shapes,
  onCreate,
}: CreatorGroupProps) {
  return (
    <section className="create-group">
      <h3 className="create-group-title">{label}</h3>

      <div className="create-shape-grid">
        {shapes.map((shape) => (
          <AppButton
            aria-pressed={activeType === shape.type}
            className={
              activeType === shape.type
                ? "create-shape-button selected"
                : "create-shape-button"
            }
            key={shape.type}
            onClick={() => onCreate(shape.type)}
            type="button"
          >
            <span className="create-shape-preview" aria-hidden="true">
              <span className={`shape-preview ${shape.preview}`} />
            </span>
            <span className="create-shape-label">{shape.label}</span>
          </AppButton>
        ))}
      </div>
    </section>
  );
}
