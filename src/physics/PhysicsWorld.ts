// src/physics/PhysicsWorld.ts

import Matter from "matter-js";

import { Vector2 } from "../app/Vector2";
import { SandboxObjectType } from "../sandbox/SandboxObject";

interface IDraggedBody {
  body: Matter.Body;
}

export class PhysicsWorld {
  private _engine?: Matter.Engine;
  private _world?: Matter.World;

  private readonly draggedBodies: IDraggedBody[] = [];
  private readonly moveToPosition = new Vector2();

  public init(): void {
    this._engine = Matter.Engine.create();
    this._world = this._engine.world;
  }

  public destroy(): void {
    this.draggedBodies.length = 0;

    if (this._world) {
      Matter.World.clear(this._world, false);
    }

    if (this._engine) {
      Matter.Engine.clear(this._engine);
    }

    this._world = undefined;
    this._engine = undefined;
  }

  public createBody(
    position: Vector2,
    type: SandboxObjectType = SandboxObjectType.Box,
  ): Matter.Body {
    if (!this._world) {
      throw new Error("PhysicsWorld not initialized");
    }

    let body: Matter.Body;

    switch (type) {
      case SandboxObjectType.Circle:
        body = Matter.Bodies.circle(position.x, position.y, 25);
        break;
      case SandboxObjectType.Ground:
        body = Matter.Bodies.rectangle(position.x, position.y, 800, 40, {
          isStatic: true,
        });
        break;
      case SandboxObjectType.Box:
      default:
        body = Matter.Bodies.rectangle(position.x, position.y, 50, 50);
    }

    Matter.World.add(this._world, body);

    return body;
  }

  public destroyBody(body: Matter.Body): void {
    if (!this._world) {
      return;
    }

    Matter.World.remove(this._world, body);
  }

  public pickBody(x: number, y: number): Matter.Body | undefined {
    if (!this._world) {
      return undefined;
    }

    const bodies = Matter.Composite.allBodies(this._world);

    return Matter.Query.point(bodies, { x, y })[0];
  }

  public getBodies(): Matter.Body[] {
    if (!this._world) {
      return [];
    }

    return Matter.Composite.allBodies(this._world);
  }

  public startDrag(bodies: Matter.Body[], position: Vector2): void {
    this.endDrag();

    this.moveToPosition.set(position);

    for (const body of bodies) {
      this.draggedBodies.push({
        body,
      });
    }
  }

  public updateDrag(position: Vector2): void {
    this.moveToPosition.set(position);
  }

  public endDrag(): void {
    this.draggedBodies.length = 0;
  }

  public update(): void {
    if (!this._engine) {
      return;
    }

    if (this.draggedBodies.length > 0) {
      const strength = 0.25;

      for (const drag of this.draggedBodies) {
        const dx = this.moveToPosition.x - drag.body.position.x;

        const dy = this.moveToPosition.y - drag.body.position.y;

        Matter.Body.setVelocity(drag.body, {
          x: dx * strength,
          y: dy * strength,
        });
      }
    }

    Matter.Engine.update(this._engine, 1000 / 60);
  }
}
