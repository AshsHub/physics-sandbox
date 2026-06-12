import {
  SandboxObjectBorderStyle,
  SandboxObjectRadialForceMode,
  type ISandboxObjectSnapshot,
} from "../sandbox/SandboxObject";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";
import type { VectorLike } from "../maths/Vector2";
import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import { boulderRunPrefab } from "./definitions/BoulderRunPrefab";
import { dominoLinePrefab } from "./definitions/DominoLinePrefab";
import { milkyWayPrefab } from "./definitions/MilkyWayPrefab";
import { basicPrefab } from "./definitions/PlatformStackPrefab";
import { repulsionChamberPrefab } from "./definitions/RepulsionChamberPrefab";
import { rubeGoldbergPrefab } from "./definitions/RubeGoldbergPrefab";
import { solarSandboxPrefab } from "./definitions/SolarSandboxPrefab";
import { brickWallPrefab } from "./definitions/BrickWallPrefab";

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

export type SerializedSandboxPrefabObject = {
  angle?: number;
  flags?: SandboxPrefabObject["flags"];
  id?: string;
  metadata?: Partial<SerializedSandboxObjectMetadata>;
  name: string;
  offset: VectorLike;
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

export const sandboxPrefabs = [
  basicPrefab,
  brickWallPrefab,
  dominoLinePrefab,
  boulderRunPrefab,
  rubeGoldbergPrefab,
  repulsionChamberPrefab,
  solarSandboxPrefab,
  milkyWayPrefab,
].map(loadSandboxPrefab);

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
  const type = parseStringEnumValue(SandboxObjectType, object.type);
  const defaultObject = SandboxObjectConfig.defaults[type];
  const metadata = object.metadata ?? {};

  return {
    ...object,
    angle: object.angle ?? 0,
    flags: object.flags ?? defaultObject.flags,
    type,
    metadata: {
      ...defaultObject.metadata,
      ...metadata,
      borderStyle: metadata.borderStyle
        ? parseStringEnumValue(SandboxObjectBorderStyle, metadata.borderStyle)
        : defaultObject.metadata.borderStyle,
      radialForceMode: metadata.radialForceMode
        ? parseStringEnumValue(
            SandboxObjectRadialForceMode,
            metadata.radialForceMode,
          )
        : defaultObject.metadata.radialForceMode,
    },
  };
}
