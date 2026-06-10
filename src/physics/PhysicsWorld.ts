// src/physics/PhysicsWorld.ts

import Matter from "matter-js";

import { PhysicsConfig } from "../config/PhysicsConfig";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import { SimulationConfig } from "../config/SimulationConfig";
import { Vector2 } from "../maths/Vector2";
import {
  SandboxObjectRadialForceMode,
  type ISandboxObject,
  type ISandboxObjectMetadata,
} from "../sandbox/SandboxObject";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";
import { getGravityMultiplier } from "./SandboxSimulation";
import { Maths } from "../maths/Maths";

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
  private lastGravityY: number = 0;
  private lastWindForce: number = SimulationConfig.wind.defaultWindForce;

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
        body = Matter.Bodies.circle(
          position.x,
          position.y,
          SandboxObjectConfig.bodyGeometry.circleRadius,
        );
        break;
      case SandboxObjectType.Triangle:
        body = Matter.Bodies.polygon(
          position.x,
          position.y,
          3,
          SandboxObjectConfig.bodyGeometry.triangleRadius,
        );
        break;
      case SandboxObjectType.Pentagon:
        body = Matter.Bodies.polygon(
          position.x,
          position.y,
          5,
          SandboxObjectConfig.bodyGeometry.pentagonRadius,
        );
        break;
      case SandboxObjectType.Oval:
        body = Matter.Bodies.circle(
          position.x,
          position.y,
          SandboxObjectConfig.bodyGeometry.ovalRadius,
          {
            slop: 0.02,
          },
        );
        Matter.Body.scale(
          body,
          SandboxObjectConfig.bodyGeometry.ovalScaleX,
          SandboxObjectConfig.bodyGeometry.ovalScaleY,
        );
        break;
      case SandboxObjectType.Platform:
        body = Matter.Bodies.rectangle(
          position.x,
          position.y,
          SandboxObjectConfig.defaults.Platform.metadata.width,
          SandboxObjectConfig.defaults.Platform.metadata.height,
          {
            isStatic: true,
          },
        );
        break;
      case SandboxObjectType.Wall:
        body = Matter.Bodies.rectangle(
          position.x,
          position.y,
          SandboxObjectConfig.defaults.Wall.metadata.width,
          SandboxObjectConfig.defaults.Wall.metadata.height,
          {
            isStatic: true,
          },
        );
        break;
      case SandboxObjectType.Ramp:
        body = Matter.Bodies.rectangle(
          position.x,
          position.y,
          SandboxObjectConfig.defaults.Ramp.metadata.width,
          SandboxObjectConfig.defaults.Ramp.metadata.height,
          {
            isStatic: true,
          },
        );
        Matter.Body.rotate(body, PhysicsConfig.body.rampAngle);
        break;
      case SandboxObjectType.Box:
      default:
        body = Matter.Bodies.rectangle(
          position.x,
          position.y,
          SandboxObjectConfig.defaults.Box.metadata.width,
          SandboxObjectConfig.defaults.Box.metadata.height,
        );
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

  public applyMetadataToBody(
    body: Matter.Body,
    previousMetadata: ISandboxObjectMetadata,
    nextMetadata: ISandboxObjectMetadata,
  ): void {
    let shouldWakeBody = false;

    const widthScale =
      previousMetadata.width > 0
        ? nextMetadata.width / previousMetadata.width
        : 1;
    const heightScale =
      previousMetadata.height > 0
        ? nextMetadata.height / previousMetadata.height
        : 1;

    if (widthScale !== 1 || heightScale !== 1) {
      Matter.Body.scale(body, widthScale, heightScale);
      shouldWakeBody = true;
    }

    body.friction = Maths.clamp(
      nextMetadata.friction,
      SandboxObjectConfig.metadataConstraints.friction.min,
      SandboxObjectConfig.metadataConstraints.friction.max,
    );
    body.restitution = Maths.clamp(
      nextMetadata.bounce,
      SandboxObjectConfig.metadataConstraints.bounce.min,
      SandboxObjectConfig.metadataConstraints.bounce.max,
    );

    if (!body.isStatic) {
      const nextMass = Math.max(
        PhysicsConfig.body.minimumDynamicMass,
        nextMetadata.mass,
      );

      if (body.mass !== nextMass) {
        Matter.Body.setMass(body, nextMass);
        shouldWakeBody = true;
      }
    }

    if (!body.isStatic && shouldWakeBody) {
      Matter.Sleeping.set(body, false);
    }
  }

  public applyFlagsToBody(body: Matter.Body, flags: SandboxObjectFlags): void {
    const shouldBeStatic = (flags & SandboxObjectFlags.Static) !== 0;

    if (body.isStatic === shouldBeStatic) {
      return;
    }

    Matter.Body.setStatic(body, shouldBeStatic);

    if (!shouldBeStatic) {
      Matter.Sleeping.set(body, false);
    }
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

  public update(objects: ISandboxObject[] = []): void {
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

    if (isSimulationRunning) {
      this.applyRadialForces(objects);
    }

    if (this.draggedBodies.length > 0) {
      const strength = PhysicsConfig.dragging.dynamicFollowStrength;

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
      Matter.Engine.update(
        this._engine,
        PhysicsConfig.simulation.fixedTimeStepMs,
      );
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

  private applyRadialForces(objects: ISandboxObject[]): void {
    const forceSources = objects.filter(
      (object) =>
        (object.flags & SandboxObjectFlags.Hidden) === 0 &&
        object.metadata.radialForceMode !== SandboxObjectRadialForceMode.None &&
        object.metadata.radialForceStrength > 0 &&
        object.metadata.radialForceRadius > 0,
    );

    if (forceSources.length === 0) {
      return;
    }

    for (const target of objects) {
      if (
        target.body.isStatic ||
        (target.flags & SandboxObjectFlags.Hidden) !== 0
      ) {
        continue;
      }

      for (const source of forceSources) {
        if (source.id === target.id) {
          continue;
        }

        const radius = source.metadata.radialForceRadius;
        const strength = source.metadata.radialForceStrength;
        const direction =
          source.metadata.radialForceMode === SandboxObjectRadialForceMode.Pull
            ? 1
            : -1;
        const dx = source.body.position.x - target.body.position.x;
        const dy = source.body.position.y - target.body.position.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared <= 0 || distanceSquared > radius * radius) {
          continue;
        }

        const distance = Math.sqrt(distanceSquared);
        const falloff = 1 - distance / radius;
        const forceMagnitude =
          strength * target.body.mass * falloff * direction;

        Matter.Body.applyForce(target.body, target.body.position, {
          x: (dx / distance) * forceMagnitude,
          y: (dy / distance) * forceMagnitude,
        });
      }
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
