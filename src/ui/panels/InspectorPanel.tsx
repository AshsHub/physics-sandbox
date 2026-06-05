import type { IApplication } from "../../application/IApplication";
import type { ISandboxObject } from "../../sandbox/SandboxObject";

import { useEditorStore } from "../../store/editorStore";
import { InspectorList } from "../inspector/InspectorList";
import { Panel } from "./Panel";

export interface InspectorPanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function InspectorPanel({ app, onClose }: InspectorPanelProps) {
  const selected = [...useEditorStore((s) => s.selectedIds)];
  useEditorStore((s) => s.objectRevision);

  if (selected.length === 0) {
    return (
      <Panel title="Inspector" onClose={onClose}>
        <div className="property">Nothing selected</div>
      </Panel>
    );
  }

  return (
    <Panel title="Inspector" onClose={onClose}>
      <InspectorList
        commands={app.commands}
        objects={selected
          .map((id) => app.engine.getObject(id))
          .filter((v): v is ISandboxObject => !!v)}
      />
    </Panel>
  );
}
