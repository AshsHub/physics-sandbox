import type { ICommandBus } from "../../commands/ICommands";
import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { useEditorStore } from "../../store/editorStore";
import { InspectorListItem } from "./InspectorListItem";

export interface InspectorListProps {
  commands: ICommandBus;
  objects: ISandboxObject[];
  selectedIds: Set<string>;
  onObjectContextMenu: (objectId: string, position: { x: number; y: number }) => void;
}

export function InspectorList({
  commands,
  objects,
  selectedIds,
  onObjectContextMenu,
}: InspectorListProps) {
  const select = useEditorStore((s) => s.select);
  const deselect = useEditorStore((s) => s.deselect);
  const setSelection = useEditorStore((s) => s.setSelection);

  const selectObject = (objectId: string, shouldToggle: boolean) => {
    if (shouldToggle) {
      if (selectedIds.has(objectId)) {
        deselect(objectId);
      } else {
        select(objectId);
      }

      return;
    }

    setSelection([objectId]);
  };

  return (
    <div className="inspector-list">
      {objects.map((object) => (
        <InspectorListItem
          key={object.id}
          commands={commands}
          entity={object}
          isSelected={selectedIds.has(object.id)}
          onSelect={(event) =>
            selectObject(object.id, event.ctrlKey || event.metaKey || event.shiftKey)
          }
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onObjectContextMenu(object.id, {
              x: event.clientX,
              y: event.clientY,
            });
          }}
        />
      ))}
    </div>
  );
}
