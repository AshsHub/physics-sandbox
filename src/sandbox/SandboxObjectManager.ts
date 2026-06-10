import { Vector2 } from "../maths/Vector2";
import Matter from "matter-js";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import {
  type ISandboxObjectMetadata,
  type ISandboxObject,
  type ISandboxObjectSnapshot,
  SandboxObjectBorderStyle,
  SandboxObjectRadialForceMode,
} from "./SandboxObject";
import { SandboxObjectFlags, SandboxObjectType } from "./SandboxObjectType";

export interface CreateSandboxObjectOptions {
  position: Vector2;
  type: SandboxObjectType;
  flags?: SandboxObjectFlags;
  id?: string;
  name?: string;
  metadata?: ISandboxObjectMetadata;
}

export class SandboxObjectManager {
  private readonly objects = new Map<string, ISandboxObject>();
  private readonly bodyLookup = new WeakMap<Matter.Body, string>();

  public constructor(private readonly physics: PhysicsWorld) {}

  public create(options: CreateSandboxObjectOptions): ISandboxObject {
    const { position, type, id, name } = options;
    const objectId = id ?? crypto.randomUUID();

    const body = this.physics.createBody(position, type);
    const defaultMetadata = createDefaultMetadata(type);
    const flags = options.flags ?? createDefaultFlags(type);
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
        `${type.charAt(0).toUpperCase()}${type.slice(1)} ${objectId.slice(0, 5)}`,
      metadata,
      flags,
    };

    this.physics.applyMetadataToBody(body, defaultMetadata, metadata);
    this.physics.applyFlagsToBody(body, flags);

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
      flags: object.flags,
      metadata: {
        ...object.metadata,
      },
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

function createDefaultFlags(type: SandboxObjectType): SandboxObjectFlags {
  switch (type) {
    case SandboxObjectType.Platform:
    case SandboxObjectType.Wall:
    case SandboxObjectType.Ramp:
      return SandboxObjectFlags.Static;
    case SandboxObjectType.Box:
    case SandboxObjectType.Circle:
    case SandboxObjectType.Triangle:
    case SandboxObjectType.Pentagon:
    case SandboxObjectType.Oval:
    default:
      return SandboxObjectFlags.None;
  }
}

function createDefaultMetadata(
  type: SandboxObjectType,
): ISandboxObjectMetadata {
  const radialForceDefaults = {
    radialForceMode: SandboxObjectRadialForceMode.None,
    radialForceRadius: 240,
    radialForceStrength: 0.0012,
  };

  const physicsDefaults = {
    mass: 1,
    bounce: 0.5,
    friction: 0.6,
  };

  switch (type) {
    case SandboxObjectType.Platform:
      return {
        width: 240,
        height: 28,
        color: "#565656",
        opacity: 1,
        borderColor: "#8a8a8a",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Platform",
        description: "Static platform body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Wall:
      return {
        width: 36,
        height: 220,
        color: "#5c5c5c",
        opacity: 1,
        borderColor: "#929292",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Wall",
        description: "Static vertical wall body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Ramp:
      return {
        width: 220,
        height: 28,
        color: "#686868",
        opacity: 1,
        borderColor: "#a0a0a0",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Ramp",
        description: "Static angled ramp body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Circle:
      return {
        width: 50,
        height: 50,
        color: "#4f8cff",
        opacity: 1,
        borderColor: "#b8d0ff",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Circle",
        description: "Dynamic circular body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Triangle:
      return {
        width: 64,
        height: 64,
        color: "#f2b84b",
        opacity: 1,
        borderColor: "#ffe1a0",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Triangle",
        description: "Dynamic triangular body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Pentagon:
      return {
        width: 60,
        height: 60,
        color: "#c17cff",
        opacity: 1,
        borderColor: "#e4c2ff",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Pentagon",
        description: "Dynamic pentagonal body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Oval:
      return {
        width: 87,
        height: 45,
        color: "#38c8b0",
        opacity: 1,
        borderColor: "#b9fff3",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Oval",
        description: "Dynamic oval body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
    case SandboxObjectType.Box:
    default:
      return {
        width: 50,
        height: 50,
        color: "#7cce83",
        opacity: 1,
        borderColor: "#d6ffd9",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Box",
        description: "Dynamic rectangular body",
        ...physicsDefaults,
        ...radialForceDefaults,
      };
  }
}
