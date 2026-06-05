import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { InspectorListItem } from "./InspectorListItem";

export interface InspectorListProps {
  objects: ISandboxObject[];
}

export function InspectorList({ objects }: InspectorListProps) {
  return (
    <div className="inspector-list">
      {objects.map((object) => (
        <InspectorListItem key={object.id} entity={object} />
      ))}
    </div>
  );
}
