export enum SandboxObjectType {
  Box = "box",
  Circle = "circle",
  Triangle = "triangle",
  Pentagon = "pentagon",
  Platform = "platform",
  Wall = "wall",
  Ramp = "ramp",
}

export enum SandboxObjectFlags {
  None = 0,
  Hidden = 1 << 0,
  Locked = 1 << 1,
}
