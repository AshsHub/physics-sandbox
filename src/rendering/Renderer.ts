import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type Matter from "matter-js";
import {
  type ISandboxObject,
  SandboxObjectBorderStyle,
} from "../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";

export class Renderer {
  constructor(private engine: ISandboxEngine) {}

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    const objects = this.engine.getAllObjects();
    const editorState = useEditorStore.getState();
    const cameraOffset = editorState.cameraOffset;
    const cameraZoom = editorState.cameraZoom;

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    for (const object of objects) {
      this.drawSandboxObject(ctx, object);
    }

    ctx.restore();
  }

  private drawSandboxObject(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
  ) {
    if (entity.flags & SandboxObjectFlags.Hidden) return;

    const body = entity.body;
    const selectedIds = useEditorStore.getState().selectedIds;
    const metadata = entity.metadata;

    ctx.save();
    ctx.globalAlpha = metadata.opacity;
    ctx.fillStyle = metadata.color;

    this.traceBodyPath(ctx, body);
    ctx.fill();

    if (
      metadata.borderStyle !== SandboxObjectBorderStyle.None &&
      metadata.borderWidth > 0
    ) {
      const visibleBorderWidth = metadata.borderWidth;

      ctx.save();
      this.traceBodyPath(ctx, body);
      ctx.clip();
      this.traceBodyPath(ctx, body);
      ctx.strokeStyle = selectedIds.has(entity.id)
        ? "orange"
        : metadata.borderColor;
      ctx.lineWidth = visibleBorderWidth * 2;
      ctx.setLineDash(getLineDash(metadata.borderStyle, visibleBorderWidth));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore();
  }

  private traceBodyPath(ctx: CanvasRenderingContext2D, body: Matter.Body) {
    const vertices = body.vertices;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
  }
}

function getLineDash(style: SandboxObjectBorderStyle, width: number): number[] {
  switch (style) {
    case SandboxObjectBorderStyle.Dashed:
      return [width * 6, width * 4];
    case SandboxObjectBorderStyle.Dotted:
      return [width, width * 3];
    case SandboxObjectBorderStyle.Solid:
    case SandboxObjectBorderStyle.None:
    default:
      return [];
  }
}
