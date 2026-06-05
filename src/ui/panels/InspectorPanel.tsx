import { useState } from "react";
import type { IApplication } from "../../application/IApplication";
import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";

import { useEditorStore } from "../../store/editorStore";
import { InspectorList } from "../inspector/InspectorList";
import { Panel } from "./Panel";

export interface InspectorPanelProps {
  app: IApplication;
  onClose?: () => void;
}

type InspectorFilter = "all" | "dynamic" | "static" | "selected";

const filters: { label: string; value: InspectorFilter }[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Dynamic",
    value: "dynamic",
  },
  {
    label: "Static",
    value: "static",
  },
  {
    label: "Selected",
    value: "selected",
  },
];

export function InspectorPanel({ app, onClose }: InspectorPanelProps) {
  const [filter, setFilter] = useState<InspectorFilter>("all");
  const selectedIds = useEditorStore((s) => s.selectedIds);
  useEditorStore((s) => s.objectRevision);

  const objects = app.engine.getAllObjects();
  const visibleObjects = objects.filter((object) =>
    shouldShowObject(object, filter, selectedIds),
  );

  return (
    <Panel title="Inspector" onClose={onClose}>
      <div className="inspector-filters" aria-label="Object filters">
        {filters.map(({ label, value }) => (
          <button
            aria-pressed={filter === value}
            className={
              filter === value
                ? "inspector-filter-button selected"
                : "inspector-filter-button"
            }
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {visibleObjects.length === 0 && (
        <div className="property">No objects match this filter</div>
      )}

      <InspectorList
        commands={app.commands}
        objects={visibleObjects}
        selectedIds={selectedIds}
      />
    </Panel>
  );
}

function shouldShowObject(
  object: ISandboxObject,
  filter: InspectorFilter,
  selectedIds: Set<string>,
): boolean {
  const isStatic = (object.flags & SandboxObjectFlags.Locked) !== 0;

  switch (filter) {
    case "dynamic":
      return !isStatic;
    case "static":
      return isStatic;
    case "selected":
      return selectedIds.has(object.id);
    case "all":
    default:
      return true;
  }
}
