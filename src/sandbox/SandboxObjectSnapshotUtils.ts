import { Vector2, type VectorLike } from "../maths/Vector2";
import { Rect } from "../maths/Rect";
import type {
  ISandboxObjectMetadata,
  ISandboxObjectSnapshot,
} from "./SandboxObject";
import type {
  SandboxObjectFlags,
  SandboxObjectType,
} from "./SandboxObjectType";

export interface BuildSandboxObjectSnapshotOptions {
  angle: number;
  flags: SandboxObjectFlags;
  id?: string;
  metadata: ISandboxObjectMetadata;
  name: string;
  position: VectorLike;
  type: SandboxObjectType;
}

export function getSnapshotCenter(
  snapshots: ISandboxObjectSnapshot[],
): VectorLike {
  if (snapshots.length === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  const bounds = Rect.fromPoints(
    snapshots.map((snapshot) => snapshot.position),
  );

  return bounds?.center ?? Vector2.zero();
}

export function buildSnapshot({
  angle,
  flags,
  id,
  metadata,
  name,
  position,
  type,
}: BuildSandboxObjectSnapshotOptions): ISandboxObjectSnapshot {
  return {
    id: id ?? crypto.randomUUID(),
    name,
    type,
    position: new Vector2(position),
    angle,
    flags,
    metadata: {
      ...metadata,
    },
  };
}

export function cloneSnapshot(
  snapshot: ISandboxObjectSnapshot,
): ISandboxObjectSnapshot {
  return buildSnapshot({
    ...snapshot,
  });
}

export function cloneSnapshots(
  snapshots: ISandboxObjectSnapshot[],
): ISandboxObjectSnapshot[] {
  return snapshots.map((snapshot) => cloneSnapshot(snapshot));
}
