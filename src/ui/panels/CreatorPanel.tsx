// CreatePanel.tsx

import type { IApplication } from "../../application/IApplication";
import { SandboxObjectType } from "../../sandbox/SandboxObjectType";
import {
  type CreatorShapeAction,
  dynamicShapes,
  staticShapes,
} from "../creatorShapes";
import { Panel } from "./Panel";

export interface CreatorPanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function CreatorPanel({ app, onClose }: CreatorPanelProps) {
  const createObject = (type: SandboxObjectType) => {
    app.commands.execute("createObject", {
      type,
    });
  };

  return (
    <Panel title="Creator" onClose={onClose}>
      <CreatorGroup
        label="Dynamic"
        shapes={dynamicShapes}
        onCreate={createObject}
      />

      <CreatorGroup
        label="Static"
        shapes={staticShapes}
        onCreate={createObject}
      />
    </Panel>
  );
}

interface CreatorGroupProps {
  label: string;
  shapes: CreatorShapeAction[];
  onCreate: (type: SandboxObjectType) => void;
}

function CreatorGroup({ label, shapes, onCreate }: CreatorGroupProps) {
  return (
    <section className="create-group">
      <h3 className="create-group-title">{label}</h3>

      <div className="create-shape-grid">
        {shapes.map((shape) => (
          <button
            className="create-shape-button"
            key={shape.type}
            onClick={() => onCreate(shape.type)}
            type="button"
          >
            <span className="create-shape-preview" aria-hidden="true">
              <span className={`shape-preview ${shape.preview}`} />
            </span>
            <span className="create-shape-label">{shape.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
