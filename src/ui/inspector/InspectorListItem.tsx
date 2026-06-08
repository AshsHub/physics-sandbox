import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { ICommandBus } from "../../commands/ICommands";
import type { ISandboxObject } from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";

export interface InspectorListItemProps {
  commands: ICommandBus;
  entity: ISandboxObject;
  isSelected: boolean;
  onSelect: (event: MouseEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
}

export function InspectorListItem({
  commands,
  entity,
  isSelected,
  onSelect,
  onContextMenu,
}: InspectorListItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(entity.name);
  const shouldCancelCommit = useRef(false);
  const isStatic = (entity.flags & SandboxObjectFlags.Locked) !== 0;
  const isHidden = (entity.flags & SandboxObjectFlags.Hidden) !== 0;
  const metadata = entity.metadata;

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
      commands.execute("updateObjectProperties", {
        objectIds: [entity.id],
        property: "name",
        value: nextName,
      });
    } else {
      setDraftName(entity.name);
    }

    setIsEditingName(false);
  };

  return (
    <div
      className={
        isSelected ? "inspector-list-item selected" : "inspector-list-item"
      }
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
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
          v
        </span>
      </div>

      {isOpen && (
        <div className="inspector-item-content">
          <div className="entity-meta-row">
            <span className="entity-meta-label">State</span>
            <span className="entity-state-badge">
              {isStatic ? "Static" : "Dynamic"}
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Type</span>
            <span className="entity-inspector-info">{entity.type}</span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Size</span>
            <span className="entity-inspector-info">
              {metadata.width} x {metadata.height}
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Fill</span>
            <span className="entity-inspector-info color-meta">
              <span
                className="color-swatch"
                style={{
                  background: metadata.color,
                }}
              />
              {metadata.color}
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Border</span>
            <span className="entity-inspector-info color-meta">
              <span
                className="color-swatch"
                style={{
                  background: metadata.borderColor,
                }}
              />
              {metadata.borderStyle}, {metadata.borderWidth}px
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Opacity</span>
            <span className="entity-inspector-info">
              {Math.round(metadata.opacity * 100)}%
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Mass</span>
            <span className="entity-inspector-info">{metadata.mass}</span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Visible</span>
            <span className="entity-inspector-info">
              {isHidden ? "Hidden" : "Visible"}
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">Selected</span>
            <span className="entity-inspector-info">
              {isSelected ? "Yes" : "No"}
            </span>
          </div>

          <div className="entity-meta-row">
            <span className="entity-meta-label">ID</span>
            <span className="entity-inspector-info">{entity.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}
