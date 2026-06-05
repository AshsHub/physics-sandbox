import type { Vector2 } from "../app/Vector2";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import {
  type ISandboxObject,
  SandboxObjectType,
  SandboxObjectFlags,
} from "./SandboxObject";

export class SandboxObjectManager {
  private readonly objects = new Map<string, ISandboxObject>();
  private readonly bodyLookup = new WeakMap<Matter.Body, string>();

  public constructor(private readonly physics: PhysicsWorld) {}

  public create(
    position: Vector2,
    type: SandboxObjectType = SandboxObjectType.Box,
  ): ISandboxObject {
    const id = crypto.randomUUID();

    const body = this.physics.createBody(position, type);

    const object: ISandboxObject = {
      id,
      type,
      body,
      name: `${type.charAt(0).toUpperCase()}${type.slice(1)} ${id.slice(0, 5)}`,
      flags: body.isStatic
        ? SandboxObjectFlags.Locked
        : SandboxObjectFlags.None,
    };

    this.objects.set(id, object);
    this.bodyLookup.set(body, id);

    return object;
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

  public rename(id: string, name: string): void {
    const object = this.objects.get(id);

    if (!object) {
      return;
    }

    object.name = name;
  }
}
