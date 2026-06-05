// InspectorPanel.tsx

import type { IApplication } from "../../abstractions/IApplication";
import type { ISandboxObject } from "../../sandbox/SandboxObject";

import { useEditorStore } from "../../store/editorStore";
import { InspectorList } from "../inspector/InspectorList";

export interface InspectorPanelProps {
  app: IApplication;
}

export function InspectorPanel({ app }: InspectorPanelProps) {
  const selected = [...useEditorStore((s) => s.selectedIds)];

  if (selected.length === 0) {
    return (
      <div className="inspector-panel">
        <h2>Inspector</h2>

        <div className="property">Nothing selected</div>
      </div>
    );
  }

  return (
    <div className="inspector-panel">
      <h2>Inspector</h2>

      <InspectorList
        objects={selected
          .map((id) => app.engine.getObject(id))
          .filter((v): v is ISandboxObject => !!v)}
      />
    </div>
  );
}
