import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import type { ICommandBus } from "../../commands/ICommands";
import {
  SandboxObjectBorderStyle,
  type ISandboxObject,
  type ISandboxObjectMetadata,
} from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";
import {
  EditableColor,
  EditableNumber,
  EditableSelect,
  ReadOnlyRow,
} from "./InspectorFields";

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

  const updateMetadata = (partial: Partial<ISandboxObjectMetadata>) => {
    commands.execute("updateObjectProperties", {
      objectIds: [entity.id],
      property: "metadata",
      value: {
        ...metadata,
        ...partial,
      },
    });
  };

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
          <InspectorSection title="Visual">
            <EditableNumber
              key={`width:${metadata.width}`}
              label="Width"
              min={4}
              value={metadata.width}
              onCommit={(width) => updateMetadata({ width })}
            />
            <EditableNumber
              key={`height:${metadata.height}`}
              label="Height"
              min={4}
              value={metadata.height}
              onCommit={(height) => updateMetadata({ height })}
            />
            <EditableColor
              key={`color:${metadata.color}`}
              label="Fill"
              value={metadata.color}
              onCommit={(color) => updateMetadata({ color })}
            />
            <EditableNumber
              key={`opacity:${metadata.opacity}`}
              label="Opacity"
              max={1}
              min={0}
              step={0.05}
              value={metadata.opacity}
              onCommit={(opacity) => updateMetadata({ opacity })}
            />
            <EditableColor
              key={`borderColor:${metadata.borderColor}`}
              label="Border"
              value={metadata.borderColor}
              onCommit={(borderColor) => updateMetadata({ borderColor })}
            />
            <EditableNumber
              key={`borderWidth:${metadata.borderWidth}`}
              label="Border px"
              min={0}
              step={1}
              value={metadata.borderWidth}
              onCommit={(borderWidth) => updateMetadata({ borderWidth })}
            />
            <EditableSelect
              label="Border style"
              value={metadata.borderStyle}
              options={Object.values(SandboxObjectBorderStyle)}
              onCommit={(borderStyle) => updateMetadata({ borderStyle })}
            />
          </InspectorSection>

          <InspectorSection title="Physics">
            {isStatic ? (
              <ReadOnlyRow label="Mass" value="Static" />
            ) : (
              <EditableNumber
                key={`mass:${metadata.mass}`}
                label="Mass"
                min={0.1}
                step={0.1}
                value={metadata.mass}
                onCommit={(mass) => updateMetadata({ mass })}
              />
            )}
            <EditableNumber
              key={`bounce:${metadata.bounce}`}
              label="Bounce"
              max={1}
              min={0}
              step={0.05}
              value={metadata.bounce}
              onCommit={(bounce) => updateMetadata({ bounce })}
            />
            <EditableNumber
              key={`friction:${metadata.friction}`}
              label="Friction"
              max={1}
              min={0}
              step={0.05}
              value={metadata.friction}
              onCommit={(friction) => updateMetadata({ friction })}
            />
          </InspectorSection>

          <InspectorSection title="Read-only">
            <ReadOnlyRow
              label="State"
              value={isStatic ? "Static" : "Dynamic"}
            />
            <ReadOnlyRow label="Type" value={entity.type} />
            <ReadOnlyRow
              label="Visible"
              value={isHidden ? "Hidden" : "Visible"}
            />
            <ReadOnlyRow label="Selected" value={isSelected ? "Yes" : "No"} />
            <ReadOnlyRow label="ID" value={entity.id} />
          </InspectorSection>
        </div>
      )}
    </div>
  );
}

function InspectorSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="inspector-section">
      <button
        className="inspector-section-header"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span className="inspector-section-title">{title}</span>
        <span
          className="chevron"
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
          }}
        >
          v
        </span>
      </button>

      {isOpen && <div className="inspector-section-content">{children}</div>}
    </section>
  );
}
