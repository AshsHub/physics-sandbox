import Matter from "matter-js";

export enum SandboxObjectType {
  Box = "box",
  Circle = "circle",
  Ground = "ground",
}

export enum SandboxObjectFlags {
  None = 0,
  Hidden = 1 << 0,
  Locked = 1 << 1,
}

export interface ISandboxObject {
  id: string;
  name: string;
  type: SandboxObjectType;
  body: Matter.Body;

  flags: SandboxObjectFlags;
}
