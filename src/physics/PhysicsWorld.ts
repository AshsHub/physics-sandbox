// src/physics/PhysicsWorld.ts

import Matter from "matter-js";

import { Vector2 } from "../maths/Vector2";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";
import { getGravityMultiplier } from "./SandboxSimulation";

interface IDraggedBody {
  body: Matter.Body;
  mode: "exact" | "soft";
  offset: Vector2;
}

export class PhysicsWorld {
  private _engine?: Matter.Engine;
  private _world?: Matter.World;

  private readonly draggedBodies: IDraggedBody[] = [];
  private readonly moveToPosition = new Vector2();
  private lastGravityY = 0;
  private lastWindForce = 0;

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
      case SandboxObjectType.Triangle:
        body = Matter.Bodies.polygon(position.x, position.y, 3, 32);
        break;
      case SandboxObjectType.Pentagon:
        body = Matter.Bodies.polygon(position.x, position.y, 5, 30);
        break;
      case SandboxObjectType.Platform:
        body = Matter.Bodies.rectangle(position.x, position.y, 240, 28, {
          isStatic: true,
        });
        break;
      case SandboxObjectType.Wall:
        body = Matter.Bodies.rectangle(position.x, position.y, 36, 220, {
          isStatic: true,
        });
        break;
      case SandboxObjectType.Ramp:
        body = Matter.Bodies.rectangle(position.x, position.y, 220, 28, {
          isStatic: true,
        });
        Matter.Body.rotate(body, -Math.PI / 8);
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
        mode: body.isStatic ? "exact" : "soft",
        offset: new Vector2(
          body.position.x - position.x,
          body.position.y - position.y,
        ),
      });
    }
  }

  public updateDrag(position: Vector2): void {
    this.moveToPosition.set(position);
  }

  public rotateDragged(angle: number): void {
    for (const drag of this.draggedBodies) {
      Matter.Body.rotate(drag.body, angle);

      if (drag.mode === "exact") {
        Matter.Body.setVelocity(drag.body, {
          x: 0,
          y: 0,
        });
        Matter.Body.setAngularVelocity(drag.body, 0);
      }
    }
  }

  public endDrag(): void {
    this.draggedBodies.length = 0;
  }

  public update(): void {
    if (!this._engine) {
      return;
    }

    const editorState = useEditorStore.getState();
    const {
      activeGravitySimulation,
      isGravityReversed,
      isSimulationRunning,
      windForce,
    } = editorState;

    const gravity =
      getGravityMultiplier(activeGravitySimulation) *
      (isGravityReversed ? -1 : 1);

    if (gravity !== this.lastGravityY || windForce !== this.lastWindForce) {
      this.wakeDynamicBodies();
      this.lastGravityY = gravity;
      this.lastWindForce = windForce;
    }

    this._engine.gravity.y = gravity;
    this._engine.gravity.x = 0;

    if (isSimulationRunning && windForce !== 0) {
      this.applyWind(windForce);
    }

    if (this.draggedBodies.length > 0) {
      const strength = 0.25;

      for (const drag of this.draggedBodies) {
        if (drag.mode === "exact") {
          Matter.Body.setPosition(drag.body, {
            x: this.moveToPosition.x + drag.offset.x,
            y: this.moveToPosition.y + drag.offset.y,
          });
          Matter.Body.setVelocity(drag.body, {
            x: 0,
            y: 0,
          });
          Matter.Body.setAngularVelocity(drag.body, 0);
          continue;
        }

        const dx = this.moveToPosition.x - drag.body.position.x;

        const dy = this.moveToPosition.y - drag.body.position.y;

        Matter.Body.setVelocity(drag.body, {
          x: dx * strength,
          y: dy * strength,
        });
      }
    }

    if (isSimulationRunning || this.draggedBodies.length > 0) {
      Matter.Engine.update(this._engine, 1000 / 60);
    }
  }

  private applyWind(force: number): void {
    if (!this._world) {
      return;
    }

    const bodies = Matter.Composite.allBodies(this._world);

    for (const body of bodies) {
      if (body.isStatic) {
        continue;
      }

      Matter.Body.applyForce(body, body.position, {
        x: force * body.mass,
        y: 0,
      });
    }
  }

  private wakeDynamicBodies(): void {
    if (!this._world) {
      return;
    }

    const bodies = Matter.Composite.allBodies(this._world);

    for (const body of bodies) {
      if (!body.isStatic) {
        Matter.Sleeping.set(body, false);
      }
    }
  }
}
