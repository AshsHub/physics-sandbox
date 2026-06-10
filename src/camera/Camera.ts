import { Vector2, type VectorLike } from "../maths/Vector2";

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CameraView {
  offset: Vector2;
  zoom: number;
  viewportSize: ViewportSize;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface CameraFitBounds {
  min: VectorLike;
  max: VectorLike;
}

export interface ViewportWorldBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export type CameraChangeHandler = (view: CameraView) => void;

const MIN_CAMERA_ZOOM = 0.2;
const MAX_CAMERA_ZOOM = 4;

export class Camera {
  private readonly offset = Vector2.zero();
  private zoom = 1;
  private viewportSize: ViewportSize = {
    width: 0,
    height: 0,
  };

  public constructor(
    initialView?: Partial<CameraView>,
    private readonly onChange?: CameraChangeHandler,
  ) {
    if (initialView?.offset) {
      this.offset.set(initialView.offset);
    }

    if (initialView?.zoom !== undefined) {
      this.zoom = Camera.clampZoom(initialView.zoom);
    }

    if (initialView?.viewportSize) {
      this.viewportSize = {
        ...initialView.viewportSize,
      };
    }
  }

  public getOffset(): Vector2 {
    return this.offset.clone();
  }

  public getZoom(): number {
    return this.zoom;
  }

  public getViewportSize(): ViewportSize {
    return {
      ...this.viewportSize,
    };
  }

  public static clampZoom(zoom: number): number {
    return Math.min(MAX_CAMERA_ZOOM, Math.max(MIN_CAMERA_ZOOM, zoom));
  }

  public pan(delta: VectorLike): void {
    this.offset.add(delta);
    this.emitChange();
  }

  public zoomAt(screenPosition: VectorLike, zoomFactor: number): void {
    const nextZoom = Camera.clampZoom(this.zoom * zoomFactor);

    if (nextZoom === this.zoom) {
      return;
    }

    const worldPosition = this.screenToWorld(screenPosition);

    this.offset.set(
      screenPosition.x - worldPosition.x * nextZoom,
      screenPosition.y - worldPosition.y * nextZoom,
    );
    this.zoom = nextZoom;
    this.emitChange();
  }

  public setView(offset: VectorLike, zoom: number): void {
    this.offset.set(offset);
    this.zoom = Camera.clampZoom(zoom);
    this.emitChange();
  }

  public setViewportSize(size: ViewportSize): void {
    if (
      this.viewportSize.width === size.width &&
      this.viewportSize.height === size.height
    ) {
      return;
    }

    this.viewportSize = {
      ...size,
    };
    this.emitChange();
  }

  public screenToWorld(screenPosition: VectorLike): Vector2 {
    return new Vector2(
      (screenPosition.x - this.offset.x) / this.zoom,
      (screenPosition.y - this.offset.y) / this.zoom,
    );
  }

  public getViewportCenterPosition(): Vector2 {
    if (this.viewportSize.width <= 0 || this.viewportSize.height <= 0) {
      return Vector2.zero();
    }

    return this.screenToWorld({
      x: this.viewportSize.width / 2,
      y: this.viewportSize.height / 2,
    });
  }

  public getViewportBounds(margin = 0): ViewportWorldBounds {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({
      x: this.viewportSize.width,
      y: this.viewportSize.height,
    });

    return {
      left: topLeft.x - margin,
      right: bottomRight.x + margin,
      top: topLeft.y - margin,
      bottom: bottomRight.y + margin,
    };
  }

  public fitBounds(
    bounds: WorldBounds,
    padding: number,
    maxZoom = MAX_CAMERA_ZOOM,
  ): void {
    if (this.viewportSize.width <= 0 || this.viewportSize.height <= 0) {
      this.setView(Vector2.zero(), 1);
      return;
    }

    const sceneWidth = Math.max(1, bounds.maxX - bounds.minX);
    const sceneHeight = Math.max(1, bounds.maxY - bounds.minY);
    const zoom = Math.min(
      (this.viewportSize.width - padding * 2) / sceneWidth,
      (this.viewportSize.height - padding * 2) / sceneHeight,
      maxZoom,
    );
    const nextZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
    const sceneCenter = {
      x: bounds.minX + sceneWidth / 2,
      y: bounds.minY + sceneHeight / 2,
    };

    this.setView(
      new Vector2(
        this.viewportSize.width / 2 - sceneCenter.x * nextZoom,
        this.viewportSize.height / 2 - sceneCenter.y * nextZoom,
      ),
      nextZoom,
    );
  }

  public fitBoundsCollection(
    boundsCollection: Iterable<CameraFitBounds>,
    padding = 64,
    maxZoom = MAX_CAMERA_ZOOM,
  ): void {
    const bounds = [...boundsCollection];

    if (
      bounds.length === 0 ||
      this.viewportSize.width <= 0 ||
      this.viewportSize.height <= 0
    ) {
      this.setView(Vector2.zero(), 1);
      return;
    }

    const sceneBounds = bounds.reduce(
      (currentBounds, objectBounds) => ({
        minX: Math.min(currentBounds.minX, objectBounds.min.x),
        maxX: Math.max(currentBounds.maxX, objectBounds.max.x),
        minY: Math.min(currentBounds.minY, objectBounds.min.y),
        maxY: Math.max(currentBounds.maxY, objectBounds.max.y),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    this.fitBounds(sceneBounds, padding, maxZoom);
  }

  private emitChange(): void {
    this.onChange?.({
      offset: this.offset.clone(),
      zoom: this.zoom,
      viewportSize: this.getViewportSize(),
    });
  }
}
