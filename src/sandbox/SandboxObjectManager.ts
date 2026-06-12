import { Vector2 } from "../maths/Vector2";
import Matter from "matter-js";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import {
  type ISandboxObjectMetadata,
  type ISandboxObject,
  type ISandboxObjectSnapshot,
} from "./SandboxObject";
import { buildSnapshot } from "./SandboxObjectSnapshotUtils";
import { SandboxObjectFlags, SandboxObjectType } from "./SandboxObjectType";

export interface CreateSandboxObjectOptions {
  position: Vector2;
  type: SandboxObjectType;
  angle?: number;
  flags?: SandboxObjectFlags;
  id?: string;
  name?: string;
  metadata?: ISandboxObjectMetadata;
}

export class SandboxObjectManager {
  private readonly _objects = new Map<string, ISandboxObject>();
  private readonly _bodyLookup = new WeakMap<Matter.Body, string>();

  public constructor(private readonly _physics: PhysicsWorld) {}

  public create(options: CreateSandboxObjectOptions): ISandboxObject {
    const { angle = 0, position, type, id, name } = options;
    const objectId = id ?? crypto.randomUUID();

    const body = this._physics.createBody(position, type, angle);
    const defaultMetadata = SandboxObjectConfig.defaults[type].metadata;
    const flags = options.flags ?? SandboxObjectConfig.defaults[type].flags;
    const metadata = {
      ...defaultMetadata,
      ...options.metadata,
    };

    const object: ISandboxObject = {
      id: objectId,
      type,
      body,
      name:
        name ??
        `${type.charAt(0).toUpperCase()}${type.slice(1)} ${objectId.slice(
          0,
          SandboxObjectConfig.naming.idPreviewLength,
        )}`,
      metadata,
      flags,
    };

    this._physics.applyMetadataToBody(body, defaultMetadata, metadata);
    this._physics.applyFlagsToBody(body, flags);

    this._objects.set(objectId, object);
    this._bodyLookup.set(body, objectId);

    return object;
  }

  public generateSnapshot(id: string): ISandboxObjectSnapshot | undefined {
    const object = this._objects.get(id);

    if (!object) {
      return;
    }

    return buildSnapshot({
      ...object,
      position: object.body.position,
      angle: object.body.angle,
    });
  }

  public createObjectFromSnapshot(
    snapshot: ISandboxObjectSnapshot,
  ): ISandboxObject {
    return this.create(snapshot);
  }

  public get(id: string): ISandboxObject | undefined {
    return this._objects.get(id);
  }

  public getAll(): ISandboxObject[] {
    return [...this._objects.values()];
  }

  public getByBody(body: Matter.Body): ISandboxObject | undefined {
    const id = this._bodyLookup.get(body);

    if (!id) {
      return;
    }

    return this._objects.get(id);
  }

  public destroy(id: string): void {
    const object = this._objects.get(id);

    if (!object) {
      return;
    }

    this._physics.destroyBody(object.body);

    this._objects.delete(id);
  }

  public destroyMany(ids: string[]): void {
    for (const id of ids) {
      this.destroy(id);
    }
  }

  public destroyAll(): void {
    for (const object of this._objects.values()) {
      this._physics.destroyBody(object.body);
    }

    this._objects.clear();
  }
}
