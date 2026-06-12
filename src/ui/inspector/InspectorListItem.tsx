import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { ICommandBus } from "../../commands/ICommands";
import {
  type ISandboxObject,
  type ISandboxObjectMetadata,
} from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { AppIcon } from "../icons/AppIcon";
import { InspectorPhysicsSection } from "./InspectorPhysicsSection";
import { InspectorReadOnlySection } from "./InspectorReadOnlySection";
import { InspectorVisualSection } from "./InspectorVisualSection";

export interface InspectorListItemProps {
  commands: ICommandBus;
  entity: ISandboxObject;
  isOpen: boolean;
  isSelected: boolean;
  shouldScrollIntoView: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (event: MouseEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
}

export function InspectorListItem({
  commands,
  entity,
  isOpen,
  isSelected,
  shouldScrollIntoView,
  onOpenChange,
  onSelect,
  onContextMenu,
}: InspectorListItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(entity.name);
  const shouldCancelCommit = useRef(false);
  const metadata = entity.metadata;

  useEffect(() => {
    if (!shouldScrollIntoView) {
      return;
    }

    itemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    useEditorStore.getState().setInspectorScrollTarget(undefined);
  }, [shouldScrollIntoView]);

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

  const updateFlags = (nextFlags: SandboxObjectFlags) => {
    commands.execute("updateObjectProperties", {
      objectIds: [entity.id],
      property: "flags",
      value: nextFlags,
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
      ref={itemRef}
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
      <div className="header" onClick={() => onOpenChange(!isOpen)}>
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
          <AppButton
            className="entity-name"
            type="button"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              startEditingName();
            }}
          >
            {entity.name}
          </AppButton>
        )}

        <AppButton
          aria-label={
            isOpen ? "Collapse inspector item" : "Expand inspector item"
          }
          className="chevron"
          type="button"
          variant="ghost"
        >
          <span
            className="chevron-icon"
            style={{
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            <AppIcon name="chevron" />
          </span>
        </AppButton>
      </div>

      {isOpen && (
        <div className="inspector-item-content">
          <InspectorVisualSection
            metadata={metadata}
            onUpdateMetadata={updateMetadata}
          />
          <InspectorPhysicsSection
            flags={entity.flags}
            metadata={metadata}
            onUpdateFlags={updateFlags}
            onUpdateMetadata={updateMetadata}
          />
          <InspectorReadOnlySection entity={entity} isSelected={isSelected} />
        </div>
      )}
    </div>
  );
}
