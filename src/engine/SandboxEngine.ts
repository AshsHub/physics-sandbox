import type { IEventBus } from "../events/IEventBus";
import type { ISandboxEngine } from "./ISandboxEngine";

import { Vector2 } from "../maths/Vector2";

import { PhysicsWorld } from "../physics/PhysicsWorld";

import {
  type ISandboxObject,
  type ISandboxObjectSnapshot,
} from "../sandbox/SandboxObject";

import { SandboxObjectManager } from "../sandbox/SandboxObjectManager";

import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";

export class SandboxEngine implements ISandboxEngine {
  private readonly physics = new PhysicsWorld();

  private readonly objects = new SandboxObjectManager(this.physics);

  private readonly events: IEventBus;

  public constructor(events: IEventBus) {
    this.events = events;
  }

  public init(): void {
    this.physics.init();

    this.createObject(new Vector2(0, 580), SandboxObjectType.Platform);
  }

  public destroy(): void {
    this.destroyAllObjects();

    this.physics.destroy();
  }

  public update(): void {
    this.physics.update();
  }

  public createObject(
    position: Vector2,
    type: SandboxObjectType = SandboxObjectType.Box,
  ): ISandboxObject {
    const object = this.objects.create({
      position,
      type,
    });

    this.events.emit("sandboxObjectCreated", {
      id: object.id,
    });

    return object;
  }

  public createSnapshot(id: string): ISandboxObjectSnapshot | undefined {
    return this.objects.createSnapshot(id);
  }

  public createObjectFromSnapshot(
    snapshot: ISandboxObjectSnapshot,
  ): ISandboxObject {
    const object = this.objects.createObjectFromSnapshot(snapshot);

    this.events.emit("sandboxObjectCreated", {
      id: object.id,
    });

    return object;
  }

  public destroyObject(id: string | string[]): void {
    const ids = Array.isArray(id) ? id : [id];

    for (const objectId of ids) {
      this.objects.destroy(objectId);

      this.events.emit("sandboxObjectDestroyed", {
        id: objectId,
      });
    }
  }

  public destroyAllObjects(): void {
    const ids = this.objects.getAll().map((o) => o.id);

    this.objects.destroyAll();

    for (const id of ids) {
      this.events.emit("sandboxObjectDestroyed", {
        id,
      });
    }
  }

  public destroySelectedObjects(): void {
    const selected = Array.from(useEditorStore.getState().selectedIds);
    this.destroyObject(selected);
  }

  public updateObjectProperty<T extends keyof ISandboxObject>(
    id: string,
    property: T,
    value: ISandboxObject[T],
  ): void {
    const object = this.objects.get(id);

    if (!object) {
      return;
    }

    object[property] = value;

    this.events.emit("sandboxObjectChanged", {
      id,
    });
  }

  public getObject(id: string): ISandboxObject | undefined {
    return this.objects.get(id);
  }

  public getAllObjects(): ISandboxObject[] {
    return this.objects.getAll();
  }

  public getObjectPosition(id: string): Vector2 | undefined {
    const object = this.objects.get(id);

    if (!object) {
      return;
    }

    return new Vector2(object.body.position.x, object.body.position.y);
  }

  public getObjectFromPosition(vector: Vector2): ISandboxObject | undefined {
    const body = this.physics.pickBody(vector.x, vector.y);

    if (!body) {
      return;
    }

    return this.objects.getByBody(body);
  }

  public startDrag(ids: string[], pos: Vector2): void {
    const bodies = ids
      .map((id) => this.objects.get(id))
      .filter((object): object is ISandboxObject => object !== undefined)
      .map((object) => object.body);

    this.physics.startDrag(bodies, pos);
  }

  public updateDrag(pos: Vector2): void {
    this.physics.updateDrag(pos);
  }

  public rotateDrag(angle: number): void {
    this.physics.rotateDragged(angle);
  }

  public endDrag(): void {
    this.physics.endDrag();
  }

  public cullObjectsOutsideViewport(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }

    const margin = 1200;
    const editorState = useEditorStore.getState();
    const cameraOffset = editorState.cameraOffset;
    const cameraZoom = editorState.cameraZoom;
    const bounds = {
      left: -cameraOffset.x / cameraZoom - margin,
      right: (width - cameraOffset.x) / cameraZoom + margin,
      top: -cameraOffset.y / cameraZoom - margin,
      bottom: (height - cameraOffset.y) / cameraZoom + margin,
    };
    const idsToCull = this.objects
      .getAll()
      .filter((object) => (object.flags & SandboxObjectFlags.Locked) === 0)
      .filter((object) => {
        const bodyBounds = object.body.bounds;

        return (
          bodyBounds.max.x < bounds.left ||
          bodyBounds.min.x > bounds.right ||
          bodyBounds.max.y < bounds.top ||
          bodyBounds.min.y > bounds.bottom
        );
      })
      .map((object) => object.id);

    if (idsToCull.length > 0) {
      this.destroyObject(idsToCull);
    }
  }
}
