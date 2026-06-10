import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type Matter from "matter-js";
import {
  type ISandboxObject,
  SandboxObjectBorderStyle,
  SandboxObjectRadialForceMode,
} from "../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";

export class Renderer {
  public constructor(private _engine: ISandboxEngine) {}

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    const objects = this._engine.getAllObjects();
    const editorState = useEditorStore.getState();
    const cameraOffset = editorState.cameraOffset;
    const cameraZoom = editorState.cameraZoom;

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    if (editorState.showForceRadius) {
      for (const object of objects) {
        this._drawForceRadius(ctx, object, cameraZoom);
      }
    }

    for (const object of objects) {
      this._drawSandboxObject(ctx, object);
    }

    ctx.restore();
  }

  private _drawSandboxObject(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
  ) {
    if (entity.flags & SandboxObjectFlags.Hidden) return;

    const selectedIds = useEditorStore.getState().selectedIds;
    const metadata = entity.metadata;

    ctx.save();
    ctx.globalAlpha = metadata.opacity;
    ctx.fillStyle = metadata.color;

    this._traceBodyPath(ctx, entity.body);
    ctx.fill();

    if (
      metadata.borderStyle !== SandboxObjectBorderStyle.None &&
      metadata.borderWidth > 0
    ) {
      const visibleBorderWidth = metadata.borderWidth;

      ctx.save();
      this._traceBodyPath(ctx, entity.body);
      ctx.clip();
      this._traceBodyPath(ctx, entity.body);
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

  private _drawForceRadius(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
    cameraZoom: number,
  ) {
    if (entity.flags & SandboxObjectFlags.Hidden) return;

    const { radialForceMode, radialForceRadius } = entity.metadata;

    if (
      radialForceMode === SandboxObjectRadialForceMode.None ||
      radialForceRadius <= 0
    ) {
      return;
    }

    const isPull = radialForceMode === SandboxObjectRadialForceMode.Pull;
    const fillColor = isPull ? "#4f8cff20" : "#ff6c5c20";
    const strokeColor = isPull ? "#4f8cff8c" : "#ff6c5c8c";

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      entity.body.position.x,
      entity.body.position.y,
      radialForceRadius,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1 / cameraZoom;
    ctx.setLineDash([6 / cameraZoom, 4 / cameraZoom]);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  private _traceBodyPath(ctx: CanvasRenderingContext2D, body: Matter.Body) {
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
