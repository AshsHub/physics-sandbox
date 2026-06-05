// CreatePanel.tsx

import type { IApplication } from "../../abstractions/IApplication";
import { SandboxObjectType } from "../../sandbox/SandboxObject";
import { Panel } from "./Panel";

export interface CreatePanelProps {
  app: IApplication;
}

export function CreatePanel({ app }: CreatePanelProps) {
  return (
    <Panel title="Create">
      <div className="create-actions">
        <button
          className="create-button"
          onClick={() => app.commands.createSceneObject(SandboxObjectType.Box)}
        >
          Box
        </button>

        <button
          className="create-button"
          onClick={() =>
            app.commands.createSceneObject(SandboxObjectType.Circle)
          }
        >
          Circle
        </button>
      </div>
    </Panel>
  );
}
