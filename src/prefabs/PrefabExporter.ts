import { Maths } from "../maths/Maths";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { getSnapshotCenter } from "../sandbox/SandboxObjectSnapshotUtils";
import type { SerializedSandboxPrefab } from "./SandboxPrefabs";

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
    objects: snapshots.map((snapshot) => ({
      ...snapshot,
      offset: {
        x: Maths.roundToDecimalPlaces(snapshot.position.x - center.x, 4),
        y: Maths.roundToDecimalPlaces(snapshot.position.y - center.y, 4),
      },
      angle: Maths.roundToDecimalPlaces(snapshot.angle, 4),
      metadata: {
        ...snapshot.metadata,
      },
    })),
  };
}
