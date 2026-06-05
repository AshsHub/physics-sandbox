import Matter from "matter-js";
import type {
  SandboxObjectFlags,
  SandboxObjectType,
} from "./SandboxObjectType";
import type { Vector2 } from "../maths/Vector2";

export interface ISandboxObjectSnapshot {
  id: string;
  name: string;
  type: SandboxObjectType;
  position: Vector2;
}

export interface ISandboxObject {
  id: string;
  name: string;
  type: SandboxObjectType;
  body: Matter.Body;

  flags: SandboxObjectFlags;
}
