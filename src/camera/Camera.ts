import { Vector2, type VectorLike } from "../maths/Vector2";
import { CameraConfig } from "../config/CameraConfig";
import { Maths } from "../maths/Maths";
import { SandboxWorldConfig } from "../config/SandboxWorldConfig";
import { Rect, type RectLike } from "../maths/Rect";

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CameraView {
  offset: Vector2;
  zoom: number;
  viewportSize: ViewportSize;
}

export interface CameraFitOptions {
  padding?: number;
  maxZoom?: number;
  onlyIfLargerThanViewport?: boolean;
}

export interface ViewportWorldBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export type CameraChangeHandler = (view: CameraView) => void;

export class Camera {
  private readonly _offset = Vector2.zero();
  private _zoom: number = CameraConfig.zoom.initial;
  private _viewportSize: ViewportSize = {
    width: 0,
    height: 0,
  };

  public constructor(
    initialView?: Partial<CameraView>,
    private readonly _onChange?: CameraChangeHandler,
  ) {
    if (initialView?.offset) {
      this._offset.set(initialView.offset);
    }

    if (initialView?.zoom !== undefined) {
      this._zoom = Maths.clamp(
        initialView.zoom,
        CameraConfig.zoom.min,
        CameraConfig.zoom.max,
      );
    }

    if (initialView?.viewportSize) {
      this._viewportSize = {
        ...initialView.viewportSize,
      };
    }
  }

  public getOffset(): Vector2 {
    return this._offset.clone();
  }

  public getZoom(): number {
    return this._zoom;
  }

  public getViewportSize(): ViewportSize {
    return {
      ...this._viewportSize,
    };
  }

  public pan(delta: VectorLike): void {
    this._offset.add(delta);
    this._constrainToWorldBounds();
    this._emitChange();
  }

  public zoomAt(screenPosition: VectorLike, zoomFactor: number): void {
    const nextZoom = Maths.clamp(
      this._zoom * zoomFactor,
      CameraConfig.zoom.min,
      CameraConfig.zoom.max,
    );

    if (nextZoom === this._zoom) {
      return;
    }

    const worldPosition = this.screenToWorld(screenPosition);

    this._offset.set(
      screenPosition.x - worldPosition.x * nextZoom,
      screenPosition.y - worldPosition.y * nextZoom,
    );
    this._zoom = nextZoom;
    this._constrainToWorldBounds();
    this._emitChange();
  }

  public setView(offset: VectorLike, zoom: number): void {
    this._offset.set(offset);
    this._zoom = Maths.clamp(
      zoom,
      CameraConfig.zoom.min,
      CameraConfig.zoom.max,
    );
    this._constrainToWorldBounds();
    this._emitChange();
  }

  public setZoomAtViewportCenter(zoom: number): void {
    if (this._viewportSize.width <= 0 || this._viewportSize.height <= 0) {
      this.setView(this._offset, zoom);
      return;
    }

    const screenCenter = {
      x: this._viewportSize.width / 2,
      y: this._viewportSize.height / 2,
    };
    const worldCenter = this.screenToWorld(screenCenter);
    const nextZoom = Maths.clamp(
      zoom,
      CameraConfig.zoom.min,
      CameraConfig.zoom.max,
    );

    this.setView(
      new Vector2(
        screenCenter.x - worldCenter.x * nextZoom,
        screenCenter.y - worldCenter.y * nextZoom,
      ),
      nextZoom,
    );
  }

  public setViewportSize(size: ViewportSize): void {
    if (
      this._viewportSize.width === size.width &&
      this._viewportSize.height === size.height
    ) {
      return;
    }

    this._viewportSize = {
      ...size,
    };
    this._constrainToWorldBounds();
    this._emitChange();
  }

  public screenToWorld(screenPosition: VectorLike): Vector2 {
    return new Vector2(
      (screenPosition.x - this._offset.x) / this._zoom,
      (screenPosition.y - this._offset.y) / this._zoom,
    );
  }

  public getViewportCenterPosition(): Vector2 {
    if (this._viewportSize.width <= 0 || this._viewportSize.height <= 0) {
      return Vector2.zero();
    }

    return this.screenToWorld({
      x: this._viewportSize.width / 2,
      y: this._viewportSize.height / 2,
    });
  }

  public getViewportBounds(margin = 0): ViewportWorldBounds {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({
      x: this._viewportSize.width,
      y: this._viewportSize.height,
    });

    return {
      left: topLeft.x - margin,
      right: bottomRight.x + margin,
      top: topLeft.y - margin,
      bottom: bottomRight.y + margin,
    };
  }

  public fitBounds(
    target: RectLike | RectLike[],
    options: CameraFitOptions = {},
  ): void {
    const rect = Array.isArray(target)
      ? Rect.fromCollection(target)
      : new Rect(target);

    if (
      rect === undefined ||
      this._viewportSize.width <= 0 ||
      this._viewportSize.height <= 0
    ) {
      this.setView(Vector2.zero(), CameraConfig.zoom.initial);
      return;
    }

    const fitToViewOptions = {
      maxZoom: options.maxZoom ?? CameraConfig.fitView.maxZoom,
      padding: options.padding ?? CameraConfig.fitView.padding,
    };

    const sceneWidth = Math.max(1, rect.width);
    const sceneHeight = Math.max(1, rect.height);
    const availableWidth =
      this._viewportSize.width - fitToViewOptions.padding * 2;
    const availableHeight =
      this._viewportSize.height - fitToViewOptions.padding * 2;

    if (
      options.onlyIfLargerThanViewport === true &&
      sceneWidth * this._zoom <= availableWidth &&
      sceneHeight * this._zoom <= availableHeight
    ) {
      return;
    }

    const zoom = Math.min(
      availableWidth / sceneWidth,
      availableHeight / sceneHeight,
      fitToViewOptions.maxZoom,
    );
    const nextZoom =
      Number.isFinite(zoom) && zoom > 0
        ? Maths.clamp(zoom, CameraConfig.zoom.min, CameraConfig.zoom.max)
        : CameraConfig.zoom.initial;
    const sceneCenter = rect.center;

    this.setView(
      new Vector2(
        this._viewportSize.width / 2 - sceneCenter.x * nextZoom,
        this._viewportSize.height / 2 - sceneCenter.y * nextZoom,
      ),
      nextZoom,
    );
  }

  private _emitChange(): void {
    this._onChange?.({
      offset: this._offset.clone(),
      zoom: this._zoom,
      viewportSize: this.getViewportSize(),
    });
  }

  private _constrainToWorldBounds(): void {
    if (this._viewportSize.width <= 0 || this._viewportSize.height <= 0) {
      return;
    }

    const bounds = new Rect(SandboxWorldConfig.bounds);
    const viewportCenter = this.getViewportCenterPosition();
    const constrainedCenter = {
      x: Maths.clamp(viewportCenter.x, bounds.left, bounds.right),
      y: Maths.clamp(viewportCenter.y, bounds.top, bounds.bottom),
    };

    this._offset.set(
      this._viewportSize.width / 2 - constrainedCenter.x * this._zoom,
      this._viewportSize.height / 2 - constrainedCenter.y * this._zoom,
    );
  }
}
