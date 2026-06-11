import Matter from "matter-js";
import { PhysicsConfig } from "../config/PhysicsConfig";
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
    [SandboxObjectType.Ramp]: (position) => {
      const body = this._createRectangleBody(position, SandboxObjectType.Ramp);

      Matter.Body.rotate(body, PhysicsConfig.body.rampAngle);

      return body;
    },
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

    return Matter.Bodies.circle(position.x, position.y, metadata.width / 2);
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

  private _createOvalBody(position: Vector2): Matter.Body {
    const metadata =
      SandboxObjectConfig.defaults[SandboxObjectType.Oval].metadata;
    const body = Matter.Bodies.circle(
      position.x,
      position.y,
      metadata.height / (2 * SandboxObjectConfig.bodyGeometry.ovalScaleY),
      {
        slop: 0.02,
      },
    );

    Matter.Body.scale(
      body,
      SandboxObjectConfig.bodyGeometry.ovalScaleX,
      SandboxObjectConfig.bodyGeometry.ovalScaleY,
    );

    return body;
  }
}
