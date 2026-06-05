// src/canvas/CanvasView.tsx

import { useEffect, useRef } from "react";
import { Vector2 } from "../maths/Vector2";
import type { IApplication } from "../application/IApplication";
import { InteractionMode } from "../input/InteractionMode";
import { useEditorStore } from "../store/editorStore";

export interface CanvasViewProps {
  app: IApplication;
  onObjectContextMenu: (
    objectId: string,
    position: { x: number; y: number },
  ) => void;
}

export function CanvasView({ app, onObjectContextMenu }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionMode = useEditorStore((s) => s.interactionMode);
  const activePointerMode = useEditorStore((s) => s.activePointerMode);
  const hoveredObjectId = useEditorStore((s) => s.hoveredObjectId);
  const cameraOffset = useEditorStore((s) => s.cameraOffset);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let frameId = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }

      if (e.button === 0 || e.button === 1) {
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
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const canvasPosition = new Vector2(
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
      const worldPosition = new Vector2(
        canvasPosition.x - cameraOffset.x,
        canvasPosition.y - cameraOffset.y,
      );
      const object = app.engine.getObjectFromPosition(worldPosition);

      if (!object) {
        return;
      }

      onObjectContextMenu(object.id, {
        x: e.clientX,
        y: e.clientY,
      });
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("contextmenu", handleContextMenu);

    const loop = () => {
      app.update();
      app.render(ctx, canvas.width, canvas.height);

      frameId = requestAnimationFrame(loop);
    };

    loop();

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
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
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, [app, cameraOffset.x, cameraOffset.y, onObjectContextMenu]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: getCanvasCursor(
          interactionMode,
          activePointerMode,
          hoveredObjectId,
        ),
        touchAction: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

function getCanvasCursor(
  interactionMode: InteractionMode,
  activePointerMode: InteractionMode | undefined,
  hoveredObjectId: string | undefined,
): string {
  if (activePointerMode === InteractionMode.Play) {
    return "grabbing";
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
