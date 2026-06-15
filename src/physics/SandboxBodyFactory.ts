import Matter from "matter-js";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import { Vector2 } from "../maths/Vector2";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";

type BodyFactory = (position: Vector2) => Matter.Body;

export class SandboxBodyFactory {
  private readonly _bodyFactories = {
    [SandboxObjectType.BlackHole]: (position) =>
      this._createCircleBody(position, SandboxObjectType.BlackHole),
    [SandboxObjectType.Box]: (position) =>
      this._createRectangleBody(position, SandboxObjectType.Box),
    [SandboxObjectType.Circle]: (position) =>
      this._createCircleBody(position, SandboxObjectType.Circle),
    [SandboxObjectType.Oval]: (position) => this._createOvalBody(position),
    [SandboxObjectType.Pentagon]: (position) =>
      this._createPolygonBody(position, SandboxObjectType.Pentagon, 5),
    [SandboxObjectType.Platform]: (position) =>
      this._createRectangleBody(position, SandboxObjectType.Platform),
    [SandboxObjectType.RampLeft]: (position) =>
      this._createRampBody(position, SandboxObjectType.RampLeft),
    [SandboxObjectType.RampRight]: (position) =>
      this._createRampBody(position, SandboxObjectType.RampRight),
    [SandboxObjectType.Sun]: (position) =>
      this._createCircleBody(position, SandboxObjectType.Sun),
    [SandboxObjectType.Triangle]: (position) =>
      this._createPolygonBody(position, SandboxObjectType.Triangle, 3),
    [SandboxObjectType.Wall]: (position) =>
      this._createRectangleBody(position, SandboxObjectType.Wall),
    [SandboxObjectType.WhiteHole]: (position) =>
      this._createCircleBody(position, SandboxObjectType.WhiteHole),
  } satisfies Record<SandboxObjectType, BodyFactory>;

  public create(
    position: Vector2,
    type: SandboxObjectType = SandboxObjectType.Box,
  ): Matter.Body {
    const bodyFactory =
      this._bodyFactories[type] ?? this._bodyFactories[SandboxObjectType.Box];

    return bodyFactory(position);
  }

  private _createCircleBody(
    position: Vector2,
    type: SandboxObjectType,
  ): Matter.Body {
    const metadata = SandboxObjectConfig.defaults[type].metadata;
    const radius = metadata.width / 2;

    return Matter.Bodies.circle(
      position.x,
      position.y,
      radius,
      {},
      this._getCircleSides(radius),
    );
  }

  private _createPolygonBody(
    position: Vector2,
    type: SandboxObjectType,
    sides: number,
  ): Matter.Body {
    const metadata = SandboxObjectConfig.defaults[type].metadata;

    return Matter.Bodies.polygon(
      position.x,
      position.y,
      sides,
      Math.max(metadata.width, metadata.height) / 2,
    );
  }

  private _createRectangleBody(
    position: Vector2,
    type: SandboxObjectType,
  ): Matter.Body {
    const metadata = SandboxObjectConfig.defaults[type].metadata;

    return Matter.Bodies.rectangle(
      position.x,
      position.y,
      metadata.width,
      metadata.height,
    );
  }

  private _createRampBody(
    position: Vector2,
    type: SandboxObjectType.RampLeft | SandboxObjectType.RampRight,
  ): Matter.Body {
    const metadata = SandboxObjectConfig.defaults[type].metadata;
    const left = position.x - metadata.width / 2;
    const right = position.x + metadata.width / 2;
    const top = position.y - metadata.height / 2;
    const bottom = position.y + metadata.height / 2;
    const vertices =
      type === SandboxObjectType.RampRight
        ? [
            { x: left, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
          ]
        : [
            { x: left, y: bottom },
            { x: right, y: bottom },
            { x: right, y: top },
          ];

    return Matter.Bodies.fromVertices(
      position.x,
      position.y,
      [vertices],
      {},
      false,
    );
  }

  private _createOvalBody(position: Vector2): Matter.Body {
    const metadata =
      SandboxObjectConfig.defaults[SandboxObjectType.Oval].metadata;
    const radius =
      metadata.height / (2 * SandboxObjectConfig.bodyGeometry.ovalScaleY);
    const body = Matter.Bodies.circle(
      position.x,
      position.y,
      radius,
      {
        slop: 0.02,
      },
      this._getCircleSides(radius),
    );

    Matter.Body.scale(
      body,
      SandboxObjectConfig.bodyGeometry.ovalScaleX,
      SandboxObjectConfig.bodyGeometry.ovalScaleY,
    );

    return body;
  }

  private _getCircleSides(radius: number): number {
    const { circleMaxSides, circleMinSides, circlePixelsPerSide } =
      SandboxObjectConfig.bodyGeometry;

    return Math.min(
      circleMaxSides,
      Math.max(
        circleMinSides,
        Math.ceil((Math.PI * 2 * radius) / circlePixelsPerSide),
      ),
    );
  }
}
