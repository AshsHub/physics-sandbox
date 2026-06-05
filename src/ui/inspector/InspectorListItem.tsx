import { useRef, useState } from "react";
import type { ICommandBus } from "../../commands/ICommands";
import type { ISandboxObject } from "../../sandbox/SandboxObject";

export interface InspectorListItemProps {
  commands: ICommandBus;
  entity: ISandboxObject;
}

export function InspectorListItem({ commands, entity }: InspectorListItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(entity.name);
  const shouldCancelCommit = useRef(false);

  const startEditingName = () => {
    shouldCancelCommit.current = false;
    setDraftName(entity.name);
    setIsEditingName(true);
  };

  const commitName = () => {
    if (shouldCancelCommit.current) {
      shouldCancelCommit.current = false;
      setDraftName(entity.name);
      setIsEditingName(false);
      return;
    }

    const nextName = draftName.trim();

    if (nextName.length > 0 && nextName !== entity.name) {
      commands.execute("renameObject", {
        objectId: entity.id,
        name: nextName,
      });
    } else {
      setDraftName(entity.name);
    }

    setIsEditingName(false);
  };

  return (
    <div className="inspector-list-item">
      <div className="header" onClick={() => setIsOpen(!isOpen)}>
        {isEditingName ? (
          <input
            aria-label="Entity name"
            autoFocus
            className="entity-name-input"
            value={draftName}
            onBlur={commitName}
            onChange={(event) => setDraftName(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.target.select()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }

              if (event.key === "Escape") {
                shouldCancelCommit.current = true;
                event.currentTarget.blur();
              }
            }}
          />
        ) : (
          <button
            className="entity-name"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              startEditingName();
            }}
          >
            {entity.name}
          </button>
        )}

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
