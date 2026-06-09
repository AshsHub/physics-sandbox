// CreatePanel.tsx

import type { IApplication } from "../../application/IApplication";
import { SandboxObjectType } from "../../sandbox/SandboxObjectType";
import { Panel } from "./Panel";

export interface CreatePanelProps {
  app: IApplication;
  onClose?: () => void;
}

interface ShapeAction {
  label: string;
  type: SandboxObjectType;
  preview: string;
}

const dynamicShapes: ShapeAction[] = [
  {
    label: "Box",
    type: SandboxObjectType.Box,
    preview: "box",
  },
  {
    label: "Circle",
    type: SandboxObjectType.Circle,
    preview: "circle",
  },
  {
    label: "Triangle",
    type: SandboxObjectType.Triangle,
    preview: "triangle",
  },
  {
    label: "Pentagon",
    type: SandboxObjectType.Pentagon,
    preview: "pentagon",
  },
  {
    label: "Oval",
    type: SandboxObjectType.Oval,
    preview: "oval",
  },
];

const staticShapes: ShapeAction[] = [
  {
    label: "Platform",
    type: SandboxObjectType.Platform,
    preview: "platform",
  },
  {
    label: "Wall",
    type: SandboxObjectType.Wall,
    preview: "wall",
  },
  {
    label: "Ramp",
    type: SandboxObjectType.Ramp,
    preview: "ramp",
  },
];

export function CreatePanel({ app, onClose }: CreatePanelProps) {
  const createObject = (type: SandboxObjectType) => {
    app.commands.execute("createObject", {
      type,
    });
  };

  return (
    <Panel title="Create" onClose={onClose}>
      <CreateGroup
        label="Dynamic"
        shapes={dynamicShapes}
        onCreate={createObject}
      />

      <CreateGroup
        label="Static"
        shapes={staticShapes}
        onCreate={createObject}
      />
    </Panel>
  );
}

interface CreateGroupProps {
  label: string;
  shapes: ShapeAction[];
  onCreate: (type: SandboxObjectType) => void;
}

function CreateGroup({ label, shapes, onCreate }: CreateGroupProps) {
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
