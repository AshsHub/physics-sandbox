import { useState } from "react";
import type { IApplication } from "../../application/IApplication";
import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";

import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { InspectorList } from "../inspector/InspectorList";
import { Panel } from "./Panel";
import type { VectorLike } from "../../maths/Vector2";

export interface InspectorPanelProps {
  app: IApplication;
  onClose?: () => void;
  onObjectContextMenu: (objectId: string, position: VectorLike) => void;
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

export function InspectorPanel({
  app,
  onClose,
  onObjectContextMenu,
}: InspectorPanelProps) {
  const [filter, setFilter] = useState<InspectorFilter>("all");
  const selectedIds = useEditorStore((s) => s.selectedIds);
  useEditorStore((s) => s.objectRevision);

  const objects = app.engine.getAllObjects();
  const visibleObjects = objects.filter((object) =>
    shouldShowObject(object, filter, selectedIds),
  );
  const filterCounts = getFilterCounts(objects, selectedIds);

  return (
    <Panel title="Inspector" onClose={onClose}>
      <div className="inspector-filters" aria-label="Object filters">
        {filters.map(({ label, value }) => (
          <AppButton
            aria-pressed={filter === value}
            className={
              filter === value
                ? "inspector-filter-button selected"
                : "inspector-filter-button"
            }
            key={value}
            onClick={() => setFilter(value)}
            type="button"
            variant={filter === value ? "accent" : "ghost"}
          >
            <span>{label}</span>
            <span className="inspector-filter-count">
              {filterCounts[value]}
            </span>
          </AppButton>
        ))}
      </div>

      {visibleObjects.length === 0 && (
        <div className="property">No objects match this filter</div>
      )}

      <InspectorList
        commands={app.commands}
        objects={visibleObjects}
        onObjectContextMenu={onObjectContextMenu}
        selectedIds={selectedIds}
      />
    </Panel>
  );
}

function getFilterCounts(
  objects: ISandboxObject[],
  selectedIds: Set<string>,
): Record<InspectorFilter, number> {
  return {
    all: objects.length,
    dynamic: objects.filter((object) => !isStaticObject(object)).length,
    selected: objects.filter((object) => selectedIds.has(object.id)).length,
    static: objects.filter(isStaticObject).length,
  };
}

function isStaticObject(object: ISandboxObject): boolean {
  return (object.flags & SandboxObjectFlags.Static) !== 0;
}

function shouldShowObject(
  object: ISandboxObject,
  filter: InspectorFilter,
  selectedIds: Set<string>,
): boolean {
  const isStatic = isStaticObject(object);

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
