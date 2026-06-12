import {
  SandboxObjectBorderStyle,
  SandboxObjectRadialForceMode,
  type ISandboxObjectSnapshot,
} from "../sandbox/SandboxObject";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";
import type { VectorLike } from "../maths/Vector2";
import { platformStackPrefab } from "./definitions/PlatformStackPrefab";

export type SandboxPrefabObject = Omit<
  ISandboxObjectSnapshot,
  "id" | "position"
> & {
  offset: VectorLike;
};

export interface SandboxPrefab {
  description?: string;
  id: string;
  name: string;
  objects: SandboxPrefabObject[];
}

export type SerializedSandboxObjectMetadata = Omit<
  ISandboxObjectSnapshot["metadata"],
  "borderStyle" | "radialForceMode"
> & {
  borderStyle: `${SandboxObjectBorderStyle}`;
  radialForceMode: `${SandboxObjectRadialForceMode}`;
};

export type SerializedSandboxPrefabObject = Omit<
  SandboxPrefabObject,
  "metadata" | "type"
> & {
  id?: string;
  metadata: SerializedSandboxObjectMetadata;
  position?: VectorLike;
  type: `${SandboxObjectType}`;
};

export type SerializedSandboxPrefab = Omit<SandboxPrefab, "objects"> & {
  objects: SerializedSandboxPrefabObject[];
};

export function loadSandboxPrefab(
  serializedPrefab: SerializedSandboxPrefab,
): SandboxPrefab {
  return {
    ...serializedPrefab,
    objects: serializedPrefab.objects.map(loadSandboxPrefabObject),
  };
}

export const sandboxPrefabs = [platformStackPrefab].map(loadSandboxPrefab);

function parseStringEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string,
): T[keyof T] {
  const enumValue = Object.values(enumObject).find(
    (currentValue) => currentValue === value,
  );

  if (!enumValue) {
    throw new Error(`Unknown enum value: ${value}`);
  }

  return enumValue as T[keyof T];
}

function loadSandboxPrefabObject(
  object: SerializedSandboxPrefabObject,
): SandboxPrefabObject {
  return {
    angle: object.angle,
    flags: object.flags,
    name: object.name,
    offset: object.offset,
    type: parseStringEnumValue(SandboxObjectType, object.type),
    metadata: {
      ...object.metadata,
      borderStyle: parseStringEnumValue(
        SandboxObjectBorderStyle,
        object.metadata.borderStyle,
      ),
      radialForceMode: parseStringEnumValue(
        SandboxObjectRadialForceMode,
        object.metadata.radialForceMode,
      ),
    },
  };
}
