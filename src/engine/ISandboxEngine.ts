import type { Vector2 } from "../maths/Vector2";
import type {
  ISandboxObject,
  ISandboxObjectSnapshot,
} from "../sandbox/SandboxObject";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";

export interface ISandboxEngine {
  getObject(id: string): ISandboxObject | undefined;
  getObjectPosition(id: string): Vector2 | undefined;
  getObjectFromPosition(vector: Vector2): ISandboxObject | undefined;
  getAllObjects(): ISandboxObject[];
  destroyObject(id: string | string[]): void;
  destroyAllObjects(): void;
  destroySelectedObjects(): void;
  updateObjectProperty<T extends keyof ISandboxObject>(
    id: string,
    property: T,
    value: ISandboxObject[T],
  ): void;
  createObject(
    position: Vector2,
    type?: SandboxObjectType,
    angle?: number,
  ): ISandboxObject;
  createObjectFromSnapshot(snapshot: ISandboxObjectSnapshot): ISandboxObject;
  generateSnapshot(id: string): ISandboxObjectSnapshot | undefined;

  startDrag(ids: string[], pos: Vector2): void;
  updateDrag(pos: Vector2): void;
  rotateDrag(angle: number): void;
  endDrag(): void;
  cullObjectsOutsideViewport(width: number, height: number): void;

  update(): void;
}
