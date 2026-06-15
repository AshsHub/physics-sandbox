import Matter from "matter-js";
import type {
  SandboxObjectFlags,
  SandboxObjectType,
} from "./SandboxObjectType";
import type { Vector2 } from "../maths/Vector2";

export enum SandboxObjectBorderStyle {
  None = "None",
  Solid = "Solid",
  Dotted = "Dotted",
  Dashed = "Dashed",
}

export enum SandboxObjectRadialForceMode {
  None = "None",
  Pull = "Pull",
  Push = "Push",
}

export enum SandboxObjectCollisionRole {
  None = 0,
  Victim = 1 << 0,
  Killer = 1 << 1,
}

export interface ISandboxObjectMetadata {
  aspectLocked: boolean;
  width: number;
  height: number;
  color: string;
  opacity: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: SandboxObjectBorderStyle;
  label: string;
  description: string;
  mass: number;
  bounce: number;
  friction: number;
  radialForceMode: SandboxObjectRadialForceMode;
  radialForceRadius: number;
  radialForceStrength: number;
  collisionRole: SandboxObjectCollisionRole;
}

export interface ISandboxObjectSnapshot {
  id: string;
  name: string;
  type: SandboxObjectType;
  position: Vector2;
  angle: number;
  flags: SandboxObjectFlags;
  metadata: ISandboxObjectMetadata;
}

export interface ISandboxObject {
  id: string;
  name: string;
  type: SandboxObjectType;
  body: Matter.Body;
  metadata: ISandboxObjectMetadata;

  flags: SandboxObjectFlags;
}
