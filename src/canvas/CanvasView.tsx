// src/canvas/CanvasView.tsx

import { useEffect, useRef } from "react";
import { Vector2, type VectorLike } from "../maths/Vector2";
import type { IApplication } from "../application/IApplication";
import { CanvasContextMenuController } from "../input/CanvasContextMenuController";
import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";
import { SelectionBoxOverlay } from "./SelectionBoxOverlay";
import { MouseButton } from "../config/InputConfig";

export interface CanvasViewProps {
  app: IApplication;
  onCanvasContextMenu: (position: VectorLike, worldPosition: Vector2) => void;
  onObjectContextMenu: (objectId: string, position: VectorLike) => void;
}

export function CanvasView({
  app,
  onCanvasContextMenu,
  onObjectContextMenu,
}: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldSuppressNextContextMenu = useRef(false);
  const interactionMode = useEditorStore((s) => s.interactionMode);
  const activePointerMode = useEditorStore((s) => s.activePointerMode);
  const hoveredObjectId = useEditorStore((s) => s.hoveredObjectId);
  const selectionBox = useEditorStore((s) => s.selectionBox);
  const isPlacingObject = useEditorStore(
    (s) => s.objectPlacement !== undefined,
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let frameId = 0;
    const contextMenuController = new CanvasContextMenuController(app, {
      onCanvasContextMenu,
      onObjectContextMenu,
    });

    const handlePointerDown = (e: PointerEvent) => {
      const isPlacingObject =
        useEditorStore.getState().objectPlacement !== undefined;

      if (
        e.button === MouseButton.Middle ||
        (e.button === MouseButton.Secondary && isPlacingObject)
      ) {
        e.preventDefault();
      }

      if (e.button === MouseButton.Secondary && isPlacingObject) {
        shouldSuppressNextContextMenu.current = true;
      }

      if (e.button === MouseButton.Primary || e.button === MouseButton.Middle) {
        canvas.setPointerCapture(e.pointerId);
      }

      const rect = canvas.getBoundingClientRect();
      const position = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      app.pointerDown(position, e.button);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const position = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      app.pointerMove(position);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }

      app.pointerUp(e.button);
    };

    const handlePointerLeave = () => {
      app.pointerLeave();
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (shouldSuppressNextContextMenu.current) {
        shouldSuppressNextContextMenu.current = false;
        e.preventDefault();
        return;
      }

      contextMenuController.open(e, canvas);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      app.pointerWheel(
        e.deltaY,
        new Vector2(e.clientX - rect.left, e.clientY - rect.top),
      );
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("contextmenu", handleContextMenu);
    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    const loop = () => {
      app.update();
      app.render(ctx, canvas.width, canvas.height);

      frameId = requestAnimationFrame(loop);
    };

    loop();

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      app.camera.setViewportSize({
        width: canvas.width,
        height: canvas.height,
      });
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, [app, onCanvasContextMenu, onObjectContextMenu]);

  return (
    <div className="canvas-stage">
      <canvas
        ref={canvasRef}
        style={{
          cursor: getCanvasCursor(
            interactionMode,
            activePointerMode,
            hoveredObjectId,
            isPlacingObject,
          ),
          touchAction: "none",
          width: "100%",
          height: "100%",
        }}
      />

      {selectionBox && <SelectionBoxOverlay selectionBox={selectionBox} />}
    </div>
  );
}

function getCanvasCursor(
  interactionMode: InteractionMode,
  activePointerMode: InteractionMode | undefined,
  hoveredObjectId: string | undefined,
  isPlacingObject: boolean,
): string {
  if (isPlacingObject) {
    return "none";
  }

  if (activePointerMode === InteractionMode.Play) {
    return "grabbing";
  }

  if (activePointerMode === InteractionMode.Selection) {
    return "crosshair";
  }

  if (
    activePointerMode === InteractionMode.Camera ||
    interactionMode === InteractionMode.Camera
  ) {
    return "all-scroll";
  }

  if (interactionMode === InteractionMode.Play && hoveredObjectId) {
    return "grab";
  }

  if (interactionMode === InteractionMode.Selection && hoveredObjectId) {
    return "pointer";
  }

  return "default";
}
