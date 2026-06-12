import { Vector2, type VectorLike } from "./Vector2";

export interface RectLike {
  min: VectorLike;
  max: VectorLike;
}

export class Rect implements RectLike {
  public readonly min: Vector2;
  public readonly max: Vector2;

  public constructor(rect: RectLike);
  public constructor(minX: number, maxX: number, minY: number, maxY: number);
  public constructor(
    rectOrMinX: RectLike | number,
    maxX?: number,
    minY?: number,
    maxY?: number,
  ) {
    if (typeof rectOrMinX === "number") {
      this.min = new Vector2(rectOrMinX, minY ?? 0);
      this.max = new Vector2(maxX ?? rectOrMinX, maxY ?? minY ?? 0);
    } else {
      this.min = new Vector2(rectOrMinX.min);
      this.max = new Vector2(rectOrMinX.max);
    }
  }

  public static from(rect: RectLike): Rect {
    return new Rect(rect);
  }

  public static fromCollection(rects: RectLike[]): Rect | undefined {
    if (rects.length === 0) {
      return undefined;
    }

    return rects.reduce<Rect>(
      (currentRect, rect) =>
        new Rect(
          Math.min(currentRect.left, rect.min.x),
          Math.max(currentRect.right, rect.max.x),
          Math.min(currentRect.top, rect.min.y),
          Math.max(currentRect.bottom, rect.max.y),
        ),
      new Rect(rects[0]),
    );
  }

  public static fromPoints(points: VectorLike[]): Rect | undefined {
    if (points.length === 0) {
      return undefined;
    }

    return points.reduce<Rect>(
      (currentRect, point) =>
        new Rect(
          Math.min(currentRect.left, point.x),
          Math.max(currentRect.right, point.x),
          Math.min(currentRect.top, point.y),
          Math.max(currentRect.bottom, point.y),
        ),
      new Rect(points[0].x, points[0].x, points[0].y, points[0].y),
    );
  }

  public get left(): number {
    return this.min.x;
  }

  public get right(): number {
    return this.max.x;
  }

  public get top(): number {
    return this.min.y;
  }

  public get bottom(): number {
    return this.max.y;
  }

  public get width(): number {
    return this.right - this.left;
  }

  public get height(): number {
    return this.bottom - this.top;
  }

  public get center(): Vector2 {
    return new Vector2((this.left + this.right) / 2, (this.top + this.bottom) / 2);
  }

  public intersects(rect: RectLike): boolean {
    return (
      this.right >= rect.min.x &&
      this.left <= rect.max.x &&
      this.bottom >= rect.min.y &&
      this.top <= rect.max.y
    );
  }

  public toObject(): RectLike {
    return {
      min: this.min.toObject(),
      max: this.max.toObject(),
    };
  }
}
