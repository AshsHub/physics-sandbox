import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type Matter from "matter-js";
import { Rect } from "../maths/Rect";
import { RendererConfig } from "../config/RendererConfig";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import { SandboxWorldConfig } from "../config/SandboxWorldConfig";
import {
  type ISandboxObject,
  type ISandboxObjectMetadata,
  SandboxObjectBorderStyle,
  SandboxObjectCollisionRole,
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
    const viewportBounds = this._getViewportBounds(
      width,
      height,
      cameraOffset,
      cameraZoom,
    );

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    this._drawWorldBounds(ctx, cameraZoom);

    if (editorState.showForceRadius) {
      for (const object of objects) {
        if (this._isForceRadiusVisible(object, viewportBounds)) {
          this._drawForceRadius(ctx, object, cameraZoom);
        }
      }
    }

    for (const object of objects) {
      if (this._isObjectVisible(object, viewportBounds)) {
        this._drawSandboxObject(ctx, object, selectedIds, cameraZoom);
      }
    }

    this._drawObjectPlacementPreview(ctx, editorState, cameraZoom);

    ctx.restore();
  }

  private _isObjectVisible(
    entity: ISandboxObject,
    viewportBounds: Rect,
  ): boolean {
    if (entity.flags & SandboxObjectFlags.Hidden) {
      return false;
    }

    const bodyBounds = new Rect(entity.body.bounds);

    if (
      bodyBounds.width >= viewportBounds.width ||
      bodyBounds.height >= viewportBounds.height
    ) {
      return true;
    }

    return viewportBounds.intersects(bodyBounds);
  }

  private _getViewportBounds(
    width: number,
    height: number,
    cameraOffset: { x: number; y: number },
    cameraZoom: number,
  ): Rect {
    const margin = RendererConfig.culling.screenMargin / cameraZoom;

    return new Rect(
      -cameraOffset.x / cameraZoom - margin,
      (width - cameraOffset.x) / cameraZoom + margin,
      -cameraOffset.y / cameraZoom - margin,
      (height - cameraOffset.y) / cameraZoom + margin,
    );
  }

  private _isForceRadiusVisible(
    entity: ISandboxObject,
    viewportBounds: Rect,
  ): boolean {
    if (entity.flags & SandboxObjectFlags.Hidden) {
      return false;
    }

    const { radialForceMode, radialForceRadius } = entity.metadata;

    if (
      radialForceMode === SandboxObjectRadialForceMode.None ||
      radialForceRadius <= 0
    ) {
      return false;
    }

    return viewportBounds.intersects(
      new Rect(
        entity.body.position.x - radialForceRadius,
        entity.body.position.x + radialForceRadius,
        entity.body.position.y - radialForceRadius,
        entity.body.position.y + radialForceRadius,
      ),
    );
  }

  private _drawWorldBounds(
    ctx: CanvasRenderingContext2D,
    cameraZoom: number,
  ): void {
    const { bounds } = SandboxWorldConfig;
    const { worldBounds } = RendererConfig;

    ctx.save();
    ctx.strokeStyle = worldBounds.color;
    ctx.lineWidth = worldBounds.lineWidth / cameraZoom;
    ctx.setLineDash([
      worldBounds.dash / cameraZoom,
      worldBounds.gap / cameraZoom,
    ]);
    ctx.strokeRect(
      bounds.min.x,
      bounds.min.y,
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y,
    );
    ctx.setLineDash([]);
    ctx.restore();
  }

  private _drawSandboxObject(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
    selectedIds: Set<string>,
    cameraZoom: number,
  ) {
    if (entity.flags & SandboxObjectFlags.Hidden) return;

    const metadata = entity.metadata;

    ctx.save();
    ctx.globalAlpha = metadata.opacity;
    ctx.fillStyle = metadata.color;

    this._traceSandboxObjectPath(ctx, entity);
    ctx.fill();

    if (
      metadata.borderStyle !== SandboxObjectBorderStyle.None &&
      metadata.borderWidth > 0
    ) {
      const visibleBorderWidth = metadata.borderWidth;

      ctx.save();
      this._traceSandboxObjectPath(ctx, entity);
      ctx.clip();
      this._traceSandboxObjectPath(ctx, entity);
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

    if ((metadata.collisionRole & SandboxObjectCollisionRole.Killer) !== 0) {
      this._drawKillerIndicator(ctx, entity, cameraZoom);
    }

    ctx.restore();
  }

  private _drawKillerIndicator(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
    cameraZoom: number,
  ): void {
    const bounds = this._getLocalBodyBounds(entity.body);
    const { killerIndicator } = RendererConfig;
    const stripeGap = killerIndicator.stripeGap / cameraZoom;
    const stripePadding = killerIndicator.stripePadding / cameraZoom;
    const stripeExtent =
      Math.hypot(bounds.width, bounds.height) + stripePadding * 2;

    ctx.save();
    this._traceSandboxObjectPath(ctx, entity);
    ctx.clip();
    ctx.translate(entity.body.position.x, entity.body.position.y);
    ctx.rotate(entity.body.angle + killerIndicator.stripeAngleRadians);

    ctx.globalAlpha = killerIndicator.alpha;
    ctx.strokeStyle = killerIndicator.color;
    ctx.fillStyle = killerIndicator.color;
    ctx.lineWidth = killerIndicator.stripeWidth / cameraZoom;

    for (
      let startX = -stripeExtent;
      startX <= stripeExtent;
      startX += stripeGap
    ) {
      ctx.beginPath();
      ctx.moveTo(startX, -stripeExtent);
      ctx.lineTo(startX, stripeExtent);
      ctx.stroke();
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
    const fillColor = isPull ? "#ff6c5c20" : "#4f8cff20";
    const strokeColor = isPull ? "#ff6c5c8c" : "#4f8cff8c";

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
      x: (placement.screenPosition.x - editorState.cameraOffset.x) / cameraZoom,
      y: (placement.screenPosition.y - editorState.cameraOffset.y) / cameraZoom,
    };
    const metadata = SandboxObjectConfig.defaults[placement.type].metadata;
    const borderStyle = metadata.borderStyle as SandboxObjectBorderStyle;
    const offset =
      SandboxObjectConfig.bodyGeometry.polygonSpawnAngleOffset[
        placement.type as keyof typeof SandboxObjectConfig.bodyGeometry.polygonSpawnAngleOffset
      ] ?? 0;

    ctx.save();
    ctx.translate(worldPosition.x, worldPosition.y);
    ctx.rotate(placement.angle + offset);
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
      case SandboxObjectType.BlackHole:
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          SandboxObjectConfig.bodyGeometry.blackHoleRadius,
          0,
          Math.PI * 2,
        );
        return;
      case SandboxObjectType.Sun:
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          SandboxObjectConfig.bodyGeometry.sunRadius,
          0,
          Math.PI * 2,
        );
        return;
      case SandboxObjectType.WhiteHole:
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          SandboxObjectConfig.bodyGeometry.whiteHoleRadius,
          0,
          Math.PI * 2,
        );
        return;
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
      case SandboxObjectType.RampLeft:
        this._traceRampPreviewPath(ctx, metadata, "left");
        return;
      case SandboxObjectType.RampRight:
        this._traceRampPreviewPath(ctx, metadata, "right");
        return;
      case SandboxObjectType.Box:
      case SandboxObjectType.Platform:
      case SandboxObjectType.Wall:
      default:
        ctx.beginPath();
        ctx.rect(
          metadata.width / -2,
          metadata.height / -2,
          metadata.width,
          metadata.height,
        );
        return;
    }
  }

  private _traceRampPreviewPath(
    ctx: CanvasRenderingContext2D,
    metadata: ISandboxObjectMetadata,
    direction: "left" | "right",
  ): void {
    ctx.beginPath();

    if (direction === "right") {
      ctx.moveTo((metadata.width / 3) * -1, (metadata.height / 3) * -2);
      ctx.lineTo((metadata.width / 3) * -1, metadata.height / 3);
      ctx.lineTo((metadata.width / 3) * 2, metadata.height / 3);
    } else {
      ctx.moveTo((metadata.width / 3) * -2, metadata.height / 3);
      ctx.lineTo(metadata.width / 3, metadata.height / 3);
      ctx.lineTo(metadata.width / 3, (metadata.height / 3) * -2);
    }

    ctx.closePath();
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

  private _traceSandboxObjectPath(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
  ): void {
    if (this._isSmoothRoundedType(entity.type)) {
      ctx.beginPath();
      ctx.ellipse(
        entity.body.position.x,
        entity.body.position.y,
        entity.metadata.width / 2,
        entity.metadata.height / 2,
        entity.body.angle,
        0,
        Math.PI * 2,
      );
      return;
    }

    this._traceBodyPath(ctx, entity.body);
  }

  private _isSmoothRoundedType(type: SandboxObjectType): boolean {
    return (
      type === SandboxObjectType.BlackHole ||
      type === SandboxObjectType.Circle ||
      type === SandboxObjectType.Oval ||
      type === SandboxObjectType.Sun ||
      type === SandboxObjectType.WhiteHole
    );
  }

  private _getLocalBodyBounds(body: Matter.Body): Rect {
    const cos = Math.cos(-body.angle);
    const sin = Math.sin(-body.angle);
    let left = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    for (const vertex of body.vertices) {
      const dx = vertex.x - body.position.x;
      const dy = vertex.y - body.position.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      left = Math.min(left, localX);
      right = Math.max(right, localX);
      top = Math.min(top, localY);
      bottom = Math.max(bottom, localY);
    }

    return new Rect(left, right, top, bottom);
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
