import { SandboxObjectConfig } from "../config/SandboxObjectConfig";
import { Maths } from "../maths/Maths";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { getSnapshotCenter } from "../sandbox/SandboxObjectSnapshotUtils";
import type {
  SerializedSandboxObjectMetadata,
  SerializedSandboxPrefab,
  SerializedSandboxPrefabObject,
} from "./SandboxPrefabs";

export function createPrefabSource(
  snapshots: ISandboxObjectSnapshot[],
  prefabName = "Custom Prefab",
): string {
  return JSON.stringify(createSerializedPrefab(snapshots, prefabName), null, 2);
}

export function createSerializedPrefab(
  snapshots: ISandboxObjectSnapshot[],
  prefabName = "Custom Prefab",
): SerializedSandboxPrefab {
  const center = getSnapshotCenter(snapshots);

  return {
    id: "custom-prefab",
    name: prefabName,
    objects: snapshots.map((snapshot) =>
      createSerializedPrefabObject(snapshot, center),
    ),
  };
}

function createSerializedPrefabObject(
  snapshot: ISandboxObjectSnapshot,
  center: { x: number; y: number },
): SerializedSandboxPrefabObject {
  const angle = Maths.roundToDecimalPlaces(snapshot.angle, 4);
  const metadata = createMetadataOverrides(snapshot);
  const defaultObject = SandboxObjectConfig.defaults[snapshot.type];

  return {
    ...snapshot,
    offset: {
      x: Maths.roundToDecimalPlaces(snapshot.position.x - center.x, 4),
      y: Maths.roundToDecimalPlaces(snapshot.position.y - center.y, 4),
    },
    ...(angle !== 0 ? { angle } : {}),
    ...(snapshot.flags !== defaultObject.flags
      ? { flags: snapshot.flags }
      : {}),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  };
}

function createMetadataOverrides(
  snapshot: ISandboxObjectSnapshot,
): Partial<SerializedSandboxObjectMetadata> {
  const defaultMetadata = SandboxObjectConfig.defaults[snapshot.type].metadata;
  const metadataOverrides: Partial<SerializedSandboxObjectMetadata> = {};
  const writableMetadataOverrides = metadataOverrides as Record<
    string,
    unknown
  >;

  for (const key of Object.keys(snapshot.metadata) as Array<
    keyof SerializedSandboxObjectMetadata
  >) {
    if (snapshot.metadata[key] !== defaultMetadata[key]) {
      writableMetadataOverrides[key] = snapshot.metadata[key];
    }
  }

  return metadataOverrides;
}
