import { useState } from "react";
import type { ISandboxObject } from "../../sandbox/SandboxObject";

export interface InspectorListItemProps {
  entity: ISandboxObject;
}

export function InspectorListItem({ entity }: InspectorListItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="inspector-list-item">
      <div className="header" onClick={() => setIsOpen(!isOpen)}>
        <span className="entity-name">{entity.name}</span>

        <span
          className="chevron"
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="content">
          <div className="entity-inspector-info">{entity.type}</div>
          <div className="entity-inspector-info">{entity.id}</div>
        </div>
      )}
    </div>
  );
}
