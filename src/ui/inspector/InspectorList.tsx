import type { ICommandBus } from "../../commands/ICommands";
import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { InspectorListItem } from "./InspectorListItem";

export interface InspectorListProps {
  commands: ICommandBus;
  objects: ISandboxObject[];
}

export function InspectorList({ commands, objects }: InspectorListProps) {
  return (
    <div className="inspector-list">
      {objects.map((object) => (
        <InspectorListItem key={object.id} commands={commands} entity={object} />
      ))}
    </div>
  );
}
