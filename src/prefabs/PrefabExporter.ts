import { Maths } from "../maths/Maths";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { getSnapshotCenter } from "../sandbox/SandboxObjectSnapshotUtils";
import type { SandboxPrefab } from "./SandboxPrefabs";

export function createPrefabJson(
  snapshots: ISandboxObjectSnapshot[],
  prefabName = "Custom Prefab",
): string {
  const center = getSnapshotCenter(snapshots);
  const sandboxPrefab: SandboxPrefab = {
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

  return JSON.stringify(sandboxPrefab, null, 2);
}
