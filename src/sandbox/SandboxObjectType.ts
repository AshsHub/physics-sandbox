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
