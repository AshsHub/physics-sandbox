import { Vector2 } from "../maths/Vector2";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import {
  type ISandboxObject,
  type ISandboxObjectSnapshot,
} from "./SandboxObject";
import { SandboxObjectFlags, SandboxObjectType } from "./SandboxObjectType";

export interface CreateSandboxObjectOptions {
  position: Vector2;
  type: SandboxObjectType;
  id?: string;
  name?: string;
}

export class SandboxObjectManager {
  private readonly objects = new Map<string, ISandboxObject>();
  private readonly bodyLookup = new WeakMap<Matter.Body, string>();

  public constructor(private readonly physics: PhysicsWorld) {}

  public create(options: CreateSandboxObjectOptions): ISandboxObject {
    const { position, type, id, name } = options;
    const objectId = id ?? crypto.randomUUID();

    const body = this.physics.createBody(position, type);

    const object: ISandboxObject = {
      id: objectId,
      type,
      body,
      name:
        name ??
        `${type.charAt(0).toUpperCase()}${type.slice(1)} ${objectId.slice(0, 5)}`,
      flags: body.isStatic
        ? SandboxObjectFlags.Locked
        : SandboxObjectFlags.None,
    };

    this.objects.set(objectId, object);
    this.bodyLookup.set(body, objectId);

    return object;
  }

  public createSnapshot(id: string): ISandboxObjectSnapshot | undefined {
    const object = this.objects.get(id);

    if (!object) {
      return;
    }

    return {
      id: object.id,
      name: object.name,
      type: object.type,
      position: new Vector2(object.body.position.x, object.body.position.y),
    };
  }

  public createObjectFromSnapshot(
    snapshot: ISandboxObjectSnapshot,
  ): ISandboxObject {
    return this.create(snapshot);
  }

  public get(id: string): ISandboxObject | undefined {
    return this.objects.get(id);
  }

  public getAll(): ISandboxObject[] {
    return [...this.objects.values()];
  }

  public getByBody(body: Matter.Body): ISandboxObject | undefined {
    const id = this.bodyLookup.get(body);

    if (!id) {
      return;
    }

    return this.objects.get(id);
  }

  public destroy(id: string): void {
    const object = this.objects.get(id);

    if (!object) {
      return;
    }

    this.physics.destroyBody(object.body);

    this.objects.delete(id);
  }

  public destroyMany(ids: string[]): void {
    for (const id of ids) {
      this.destroy(id);
    }
  }

  public destroyAll(): void {
    for (const object of this.objects.values()) {
      this.physics.destroyBody(object.body);
    }

    this.objects.clear();
  }
}
