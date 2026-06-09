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

export interface ISandboxObjectMetadata {
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
}

export interface ISandboxObjectSnapshot {
  id: string;
  name: string;
  type: SandboxObjectType;
  position: Vector2;
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
