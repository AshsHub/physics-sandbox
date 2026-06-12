// src/physics/PhysicsWorld.ts

import Matter from "matter-js";

import { PhysicsConfig } from "../config/PhysicsConfig";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import { SimulationConfig } from "../config/SimulationConfig";
import { Vector2 } from "../maths/Vector2";
import {
  SandboxObjectCollisionRole,
  SandboxObjectRadialForceMode,
  type ISandboxObject,
  type ISandboxObjectMetadata,
} from "../sandbox/SandboxObject";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";
import { SandboxBodyFactory } from "./SandboxBodyFactory";
import { getGravityMultiplier } from "./SandboxSimulation";
import { Maths } from "../maths/Maths";

interface IDraggedBody {
  body: Matter.Body;
  isRotationLocked: boolean;
  mode: "exact" | "soft";
  offset: Vector2;
  previousInertia: number;
  rotationLockFramesRemaining: number;
}

export class PhysicsWorld {
  private _engine?: Matter.Engine;
  private _world?: Matter.World;

  private readonly _bodyFactory = new SandboxBodyFactory();
  private readonly _draggedBodies: IDraggedBody[] = [];
  private readonly _moveToPosition = new Vector2();
  private _lastGravityY: number = 0;
  private _lastWindForce: number = SimulationConfig.wind.defaultWindForce;

  public init(): void {
    this._engine = Matter.Engine.create();
    this._world = this._engine.world;
  }

  public destroy(): void {
    this._draggedBodies.length = 0;

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
    angle = 0,
  ): Matter.Body {
    if (!this._world) {
      throw new Error("PhysicsWorld not initialized");
    }

    const body = this._bodyFactory.create(position, type);

    if (angle !== 0) {
      Matter.Body.rotate(body, angle);
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
      this._scaleBodyLocal(body, widthScale, heightScale);
      shouldWakeBody = true;
    }

    const friction = Maths.clamp(
      nextMetadata.friction,
      SandboxObjectConfig.metadataConstraints.friction.min,
      SandboxObjectConfig.metadataConstraints.friction.max,
    );

    body.friction = friction;
    body.frictionStatic = friction * PhysicsConfig.body.frictionStaticMultiplier;
    body.restitution = Maths.clamp(
      nextMetadata.bounce,
      SandboxObjectConfig.metadataConstraints.bounce.min,
      SandboxObjectConfig.metadataConstraints.bounce.max,
    );

    if (!body.isStatic) {
      const nextMass = this._getDynamicMass(nextMetadata.mass);

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

    this._moveToPosition.set(position);
    const isSimulationRunning = useEditorStore.getState().isSimulationRunning;

    for (const body of bodies) {
      this._draggedBodies.push({
        body,
        isRotationLocked: false,
        mode: body.isStatic || !isSimulationRunning ? "exact" : "soft",
        offset: new Vector2(
          body.position.x - position.x,
          body.position.y - position.y,
        ),
        previousInertia: body.inertia,
        rotationLockFramesRemaining: 0,
      });
    }
  }

  public updateDrag(position: Vector2): void {
    this._moveToPosition.set(position);
  }

  public rotateDragged(angle: number): void {
    for (const drag of this._draggedBodies) {
      this._lockDragRotation(drag);
      Matter.Body.rotate(drag.body, angle);
      Matter.Body.setAngularVelocity(drag.body, 0);
    }
  }

  public endDrag(): void {
    for (const drag of this._draggedBodies) {
      this._unlockDragRotation(drag);
    }

    this._draggedBodies.length = 0;
  }

  public update(objects: ISandboxObject[] = []): string[] {
    if (!this._engine) {
      return [];
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

    if (gravity !== this._lastGravityY || windForce !== this._lastWindForce) {
      this._wakeDynamicBodies();
      this._lastGravityY = gravity;
      this._lastWindForce = windForce;
    }

    this._engine.gravity.y = gravity;
    this._engine.gravity.x = 0;

    if (isSimulationRunning && windForce !== 0) {
      this._applyWind(windForce);
    }

    if (isSimulationRunning) {
      this._applyRadialForces(objects);
    }

    if (this._draggedBodies.length > 0) {
      const strength = PhysicsConfig.dragging.dynamicFollowStrength;

      for (const drag of this._draggedBodies) {
        drag.mode =
          drag.body.isStatic || !isSimulationRunning ? "exact" : "soft";

        if (drag.mode === "exact") {
          Matter.Body.setPosition(drag.body, {
            x: this._moveToPosition.x + drag.offset.x,
            y: this._moveToPosition.y + drag.offset.y,
          });
          Matter.Body.setVelocity(drag.body, {
            x: 0,
            y: 0,
          });
          continue;
        }

        const dx = this._moveToPosition.x - drag.body.position.x;

        const dy = this._moveToPosition.y - drag.body.position.y;

        Matter.Body.setVelocity(drag.body, {
          x: dx * strength,
          y: dy * strength,
        });
      }
    }

    if (isSimulationRunning) {
      Matter.Engine.update(
        this._engine,
        PhysicsConfig.simulation.fixedTimeStepMs,
      );
    }

    this._updateDragRotationLocks();

    return this._getKilledObjectIds(objects);
  }

  private _getKilledObjectIds(objects: ISandboxObject[]): string[] {
    if (!this._engine) {
      return [];
    }

    const objectByBody = new Map<Matter.Body, ISandboxObject>();
    const killedIds = new Set<string>();

    for (const object of objects) {
      objectByBody.set(object.body, object);
    }

    for (const pair of this._engine.pairs.list) {
      if (!pair.isActive) {
        continue;
      }

      const objectA = objectByBody.get(pair.bodyA);
      const objectB = objectByBody.get(pair.bodyB);

      if (!objectA || !objectB) {
        continue;
      }

      this._collectKilledObjectId(objectA, objectB, killedIds);
      this._collectKilledObjectId(objectB, objectA, killedIds);
    }

    return [...killedIds];
  }

  private _collectKilledObjectId(
    possibleVictim: ISandboxObject,
    possibleKiller: ISandboxObject,
    killedIds: Set<string>,
  ): void {
    const victimRole = possibleVictim.metadata.collisionRole;
    const killerRole = possibleKiller.metadata.collisionRole;

    if (
      (victimRole & SandboxObjectCollisionRole.Victim) === 0 ||
      (killerRole & SandboxObjectCollisionRole.Killer) === 0 ||
      (possibleVictim.flags & SandboxObjectFlags.Hidden) !== 0 ||
      (possibleKiller.flags & SandboxObjectFlags.Hidden) !== 0
    ) {
      return;
    }

    killedIds.add(possibleVictim.id);
  }

  private _applyWind(force: number): void {
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

  private _applyRadialForces(objects: ISandboxObject[]): void {
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

  private _wakeDynamicBodies(): void {
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

  private _getDynamicMass(mass: number): number {
    return Math.max(PhysicsConfig.body.minimumDynamicMass, mass);
  }

  private _scaleBodyLocal(
    body: Matter.Body,
    widthScale: number,
    heightScale: number,
  ): void {
    const angle = body.angle;

    if (angle !== 0) {
      Matter.Body.rotate(body, -angle);
    }

    Matter.Body.scale(body, widthScale, heightScale);

    if (angle !== 0) {
      Matter.Body.rotate(body, angle);
    }
  }

  private _lockDragRotation(drag: IDraggedBody): void {
    if (!drag.isRotationLocked) {
      drag.previousInertia = drag.body.inertia;
      Matter.Body.setInertia(drag.body, Infinity);
      drag.isRotationLocked = true;
    }

    drag.rotationLockFramesRemaining =
      PhysicsConfig.dragging.manualRotationLockFrames;
  }

  private _unlockDragRotation(drag: IDraggedBody): void {
    if (!drag.isRotationLocked) {
      return;
    }

    Matter.Body.setAngularVelocity(drag.body, 0);
    Matter.Body.setInertia(drag.body, drag.previousInertia);
    drag.isRotationLocked = false;
    drag.rotationLockFramesRemaining = 0;
  }

  private _updateDragRotationLocks(): void {
    for (const drag of this._draggedBodies) {
      if (!drag.isRotationLocked) {
        continue;
      }

      Matter.Body.setAngularVelocity(drag.body, 0);
      drag.rotationLockFramesRemaining -= 1;

      if (drag.rotationLockFramesRemaining <= 0) {
        this._unlockDragRotation(drag);
      }
    }
  }
}
