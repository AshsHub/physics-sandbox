import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type Matter from "matter-js";
import { PhysicsConfig } from "../config/PhysicsConfig";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import {
  type ISandboxObject,
  type ISandboxObjectMetadata,
  SandboxObjectBorderStyle,
  SandboxObjectRadialForceMode,
} from "../sandbox/SandboxObject";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";
import { InteractionMode } from "../input/InteractionMode";

export class Renderer {
  public constructor(private _engine: ISandboxEngine) {}

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    const objects = this._engine.getAllObjects();
    const editorState = useEditorStore.getState();
    const cameraOffset = editorState.cameraOffset;
    const cameraZoom = editorState.cameraZoom;
    const selectedIds = editorState.selectedIds;

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    if (editorState.showForceRadius) {
      for (const object of objects) {
        this._drawForceRadius(ctx, object, cameraZoom);
      }
    }

    for (const object of objects) {
      this._drawSandboxObject(ctx, object, selectedIds);
    }

    this._drawObjectPlacementPreview(ctx, editorState, cameraZoom);

    ctx.restore();
  }

  private _drawSandboxObject(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
    selectedIds: Set<string>,
  ) {
    if (entity.flags & SandboxObjectFlags.Hidden) return;

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
      ctx.setLineDash(
        this._getLineDash(metadata.borderStyle, visibleBorderWidth),
      );
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

  private _drawObjectPlacementPreview(
    ctx: CanvasRenderingContext2D,
    editorState: ReturnType<typeof useEditorStore.getState>,
    cameraZoom: number,
  ): void {
    const placement = editorState.objectPlacement;

    if (
      !placement?.screenPosition ||
      editorState.activePointerMode === InteractionMode.Camera
    ) {
      return;
    }

    const worldPosition = {
      x: (placement.screenPosition.x - editorState.cameraOffset.x) /
        cameraZoom,
      y: (placement.screenPosition.y - editorState.cameraOffset.y) /
        cameraZoom,
    };
    const metadata = SandboxObjectConfig.defaults[placement.type].metadata;
    const borderStyle = metadata.borderStyle as SandboxObjectBorderStyle;

    ctx.save();
    ctx.translate(worldPosition.x, worldPosition.y);
    ctx.rotate(
      placement.type === SandboxObjectType.Ramp
        ? placement.angle + PhysicsConfig.body.rampAngle
        : placement.angle,
    );
    ctx.globalAlpha = 0.58;
    ctx.fillStyle = metadata.color;
    ctx.strokeStyle = metadata.borderColor;
    ctx.lineWidth = Math.max(1 / cameraZoom, metadata.borderWidth);

    this._traceObjectTypePreviewPath(ctx, placement.type, metadata);
    ctx.fill();

    if (
      borderStyle !== SandboxObjectBorderStyle.None &&
      metadata.borderWidth > 0
    ) {
      ctx.setLineDash(this._getLineDash(borderStyle, ctx.lineWidth));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private _traceObjectTypePreviewPath(
    ctx: CanvasRenderingContext2D,
    type: SandboxObjectType,
    metadata: ISandboxObjectMetadata,
  ): void {
    switch (type) {
      case SandboxObjectType.Circle:
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          SandboxObjectConfig.bodyGeometry.circleRadius,
          0,
          Math.PI * 2,
        );
        return;
      case SandboxObjectType.Oval:
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          SandboxObjectConfig.bodyGeometry.ovalRadius *
            SandboxObjectConfig.bodyGeometry.ovalScaleX,
          SandboxObjectConfig.bodyGeometry.ovalRadius *
            SandboxObjectConfig.bodyGeometry.ovalScaleY,
          0,
          0,
          Math.PI * 2,
        );
        return;
      case SandboxObjectType.Triangle:
        this._tracePolygonPreviewPath(
          ctx,
          3,
          SandboxObjectConfig.bodyGeometry.triangleRadius,
        );
        return;
      case SandboxObjectType.Pentagon:
        this._tracePolygonPreviewPath(
          ctx,
          5,
          SandboxObjectConfig.bodyGeometry.pentagonRadius,
        );
        return;
      case SandboxObjectType.Box:
      case SandboxObjectType.Platform:
      case SandboxObjectType.Wall:
      case SandboxObjectType.Ramp:
      default:
        ctx.beginPath();
        ctx.rect(
          metadata.width / -2,
          metadata.height / -2,
          metadata.width,
          metadata.height,
        );
    }
  }

  private _tracePolygonPreviewPath(
    ctx: CanvasRenderingContext2D,
    sides: number,
    radius: number,
  ): void {
    const theta = (Math.PI * 2) / sides;
    const offset = theta * 0.5;

    ctx.beginPath();

    for (let index = 0; index < sides; index++) {
      const angle = offset + index * theta;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
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

  private _getLineDash(
    style: SandboxObjectBorderStyle,
    width: number,
  ): number[] {
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
}
