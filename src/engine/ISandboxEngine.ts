import type {
  ISandboxObject,
  ISandboxObjectSnapshot,
} from "../sandbox/SandboxObject";
import type { Vector2 } from "../maths/Vector2";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";

export interface ISandboxEngine {
  getObject(id: string): ISandboxObject | undefined;
  getObjectPosition(id: string): Vector2 | undefined;
  getObjectFromPosition(vector: Vector2): ISandboxObject | undefined;
  getAllObjects(): ISandboxObject[];
  destroyObject(id: string | string[]): void;
  destroyAllObjects(): void;
  destroySelectedObjects(): void;
  renameObject(id: string, name: string): void;
  createObject(position: Vector2, type?: SandboxObjectType): ISandboxObject;
  createObjectFromSnapshot(snapshot: ISandboxObjectSnapshot): ISandboxObject;
  createSnapshot(id: string): ISandboxObjectSnapshot | undefined;

  startDrag(ids: string[], pos: Vector2): void;
  updateDrag(pos: Vector2): void;
  endDrag(): void;

  update(): void;
}
