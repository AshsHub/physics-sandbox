import type { IEventBus } from "../events/IEventBus";
import type { ISandboxEngine } from "./ISandboxEngine";

import type { Camera } from "../camera/Camera";
import { CameraConfig } from "../config/CameraConfig";
import { InitialSceneConfig } from "../config/InitialSceneConfig";
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
  private readonly _physics = new PhysicsWorld();

  private readonly _objects = new SandboxObjectManager(this._physics);

  private readonly _events: IEventBus;

  public constructor(
    events: IEventBus,
    private readonly _camera: Camera,
  ) {
    this._events = events;
  }

  public init(): void {
    this._physics.init();

    for (const object of InitialSceneConfig.objects) {
      this.createObject(new Vector2(object.position), object.type);
    }
  }

  public destroy(): void {
    this.destroyAllObjects();

    this._physics.destroy();
  }

  public update(): void {
    this._physics.update(this._objects.getAll());
  }

  public createObject(
    position: Vector2,
    type: SandboxObjectType = SandboxObjectType.Box,
    angle = 0,
  ): ISandboxObject {
    const object = this._objects.create({
      angle,
      position,
      type,
    });

    this._events.emit("sandboxObjectCreated", {
      id: object.id,
    });

    return object;
  }

  public createSnapshot(id: string): ISandboxObjectSnapshot | undefined {
    return this._objects.createSnapshot(id);
  }

  public createObjectFromSnapshot(
    snapshot: ISandboxObjectSnapshot,
  ): ISandboxObject {
    const object = this._objects.createObjectFromSnapshot(snapshot);

    this._events.emit("sandboxObjectCreated", {
      id: object.id,
    });

    return object;
  }

  public destroyObject(id: string | string[]): void {
    const ids = Array.isArray(id) ? id : [id];

    for (const objectId of ids) {
      this._objects.destroy(objectId);

      this._events.emit("sandboxObjectDestroyed", {
        id: objectId,
      });
    }
  }

  public destroyAllObjects(): void {
    const ids = this._objects.getAll().map((o) => o.id);

    this._objects.destroyAll();

    for (const id of ids) {
      this._events.emit("sandboxObjectDestroyed", {
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
    const object = this._objects.get(id);

    if (!object) {
      return;
    }

    if (property === "metadata") {
      this._physics.applyMetadataToBody(
        object.body,
        object.metadata,
        value as ISandboxObject["metadata"],
      );
    }

    if (property === "flags") {
      this._physics.applyFlagsToBody(
        object.body,
        value as ISandboxObject["flags"],
      );
    }

    object[property] = value;

    this._events.emit("sandboxObjectChanged", {
      id,
    });
  }

  public getObject(id: string): ISandboxObject | undefined {
    return this._objects.get(id);
  }

  public getAllObjects(): ISandboxObject[] {
    return this._objects.getAll();
  }

  public getObjectPosition(id: string): Vector2 | undefined {
    const object = this._objects.get(id);

    if (!object) {
      return;
    }

    return new Vector2(object.body.position.x, object.body.position.y);
  }

  public getObjectFromPosition(vector: Vector2): ISandboxObject | undefined {
    const body = this._physics.pickBody(vector.x, vector.y);

    if (!body) {
      return;
    }

    return this._objects.getByBody(body);
  }

  public startDrag(ids: string[], pos: Vector2): void {
    const bodies = ids
      .map((id) => this._objects.get(id))
      .filter((object): object is ISandboxObject => object !== undefined)
      .filter((object) => (object.flags & SandboxObjectFlags.Locked) === 0)
      .map((object) => object.body);

    this._physics.startDrag(bodies, pos);
  }

  public updateDrag(pos: Vector2): void {
    this._physics.updateDrag(pos);
  }

  public rotateDrag(angle: number): void {
    this._physics.rotateDragged(angle);
  }

  public endDrag(): void {
    this._physics.endDrag();
  }

  public cullObjectsOutsideViewport(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }

    const margin = CameraConfig.culling.viewportMargin;
    const bounds = this._camera.getViewportBounds(margin);
    const idsToCull = this._objects
      .getAll()
      .filter(
        (object) =>
          (object.flags &
            (SandboxObjectFlags.Locked | SandboxObjectFlags.Static)) ===
          0,
      )
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
