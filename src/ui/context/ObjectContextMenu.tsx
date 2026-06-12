import { useEffect, useRef, useState } from "react";
import type { IApplication } from "../../application/IApplication";
import type { Vector2 } from "../../maths/Vector2";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { ClipboardContextSubmenu } from "./ClipboardContextSubmenu";

export interface ObjectContextMenuProps {
  app: IApplication;
  objectId: string;
  targetIds: string[];
  position: Vector2;
  onClose: () => void;
}

export function ObjectContextMenu({
  app,
  objectId,
  targetIds,
  position,
  onClose,
}: ObjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const object = app.engine.getObject(objectId);
  const [draftName, setDraftName] = useState(object?.name ?? "");
  useEditorStore((s) => s.objectRevision);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        menuRef.current.contains(event.target)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!object) {
    return null;
  }

  const commitName = () => {
    const nextName = draftName.trim();

    if (nextName.length === 0) {
      setDraftName(object.name);
      return;
    }

    if (nextName !== object.name) {
      app.commands.execute("updateObjectProperties", {
        objectIds: [object.id],
        property: "name",
        value: nextName,
      });
    }
  };

  const deleteObjects = () => {
    app.commands.execute("deleteObject", {
      ids: targetIds,
    });
    onClose();
  };

  const revealInInspector = () => {
    const editorStore = useEditorStore.getState();

    editorStore.setSelection([object.id]);
    editorStore.setActivePanel(SidebarPanel.Inspector);
    editorStore.setInspectorItemOpen(object.id, true);
    editorStore.setInspectorScrollTarget(object.id);
    onClose();
  };

  return (
    <div
      className="object-context-menu"
      ref={menuRef}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <input
        aria-label="Object name"
        autoFocus
        className="object-context-menu-input"
        value={draftName}
        onBlur={commitName}
        onChange={(event) => setDraftName(event.target.value)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            setDraftName(object.name);
            onClose();
          }
        }}
      />

      <AppButton
        className="object-context-menu-action"
        onClick={revealInInspector}
        onPointerDown={(event) => event.preventDefault()}
        type="button"
      >
        Show in Inspector
      </AppButton>

      <ClipboardContextSubmenu
        app={app}
        targetIds={targetIds}
        onClose={onClose}
      />

      <AppButton
        className="object-context-menu-action"
        onClick={deleteObjects}
        onPointerDown={(event) => event.preventDefault()}
        type="button"
      >
        {targetIds.length > 1 ? `Delete ${targetIds.length} objects` : "Delete"}
      </AppButton>
    </div>
  );
}
