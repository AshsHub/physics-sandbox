// src/canvas/CanvasView.tsx

import { useEffect, useRef } from "react";
import { Vector2 } from "../maths/Vector2";
import type { IApplication } from "../application/IApplication";

export interface CanvasViewProps {
  app: IApplication;
}

export function CanvasView({ app }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let frameId = 0;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const position = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      app.pointerDown(position);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const position = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      app.pointerMove(position);
    };

    const handleMouseUp = () => {
      app.pointerUp();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("mousedown", handleMouseDown);

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
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}
