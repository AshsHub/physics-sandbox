// CreatePanel.tsx

import type { IApplication } from "../../application/IApplication";
import { SandboxObjectType } from "../../sandbox/SandboxObjectType";
import { Panel } from "./Panel";

export interface CreatePanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function CreatePanel({ app, onClose }: CreatePanelProps) {
  return (
    <Panel title="Create" onClose={onClose}>
      <div className="create-actions">
        <button
          className="create-button"
          onClick={() =>
            app.commands.execute("createObject", {
              type: SandboxObjectType.Box,
            })
          }
        >
          Box
        </button>

        <button
          className="create-button"
          onClick={() =>
            app.commands.execute("createObject", {
              type: SandboxObjectType.Circle,
            })
          }
        >
          Circle
        </button>
      </div>
    </Panel>
  );
}
