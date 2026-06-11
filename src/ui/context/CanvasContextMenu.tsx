import { useEffect, useRef } from "react";
import type { IApplication } from "../../application/IApplication";
import type { Vector2 } from "../../maths/Vector2";
import type { SandboxObjectType } from "../../sandbox/SandboxObjectType";
import {
  celestialShapes,
  type CreatorShapeAction,
  dynamicShapes,
  staticShapes,
} from "../creatorShapes";
import { AppButton } from "../common/AppButton";
import { ClipboardContextSubmenu } from "./ClipboardContextSubmenu";

export interface CanvasContextMenuProps {
  app: IApplication;
  position: Vector2;
  worldPosition: Vector2;
  onClose: () => void;
}

export function CanvasContextMenu({
  app,
  position,
  worldPosition,
  onClose,
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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

  const createObject = (type: SandboxObjectType) => {
    app.commands.execute("createObject", {
      type,
      position: worldPosition.clone(),
    });
    onClose();
  };

  return (
    <div
      className="canvas-context-menu"
      ref={menuRef}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="canvas-context-menu-submenu">
        <AppButton className="canvas-context-menu-submenu-trigger" type="button">
          <span>Create</span>
          <span aria-hidden="true">&gt;</span>
        </AppButton>

        <div className="canvas-context-menu-subpanel">
          <CanvasContextMenuGroup
            label="Dynamic"
            shapes={dynamicShapes}
            onCreate={createObject}
          />
          <CanvasContextMenuGroup
            label="Static"
            shapes={staticShapes}
            onCreate={createObject}
          />
          <CanvasContextMenuGroup
            label="Celestial"
            shapes={celestialShapes}
            onCreate={createObject}
          />
        </div>
      </div>

      <ClipboardContextSubmenu app={app} onClose={onClose} />
    </div>
  );
}

function CanvasContextMenuGroup({
  label,
  shapes,
  onCreate,
}: {
  label: string;
  shapes: CreatorShapeAction[];
  onCreate: (type: SandboxObjectType) => void;
}) {
  return (
    <section className="canvas-context-menu-group">
      <h3 className="canvas-context-menu-group-title">{label}</h3>
      <div className="canvas-context-menu-grid">
        {shapes.map((shape) => (
          <AppButton
            className="canvas-context-menu-create-button"
            key={shape.type}
            onClick={() => onCreate(shape.type)}
            onPointerDown={(event) => event.preventDefault()}
            type="button"
          >
            <span className="create-shape-preview" aria-hidden="true">
              <span className={`shape-preview ${shape.preview}`} />
            </span>
            <span className="create-shape-label">{shape.label}</span>
          </AppButton>
        ))}
      </div>
    </section>
  );
}
