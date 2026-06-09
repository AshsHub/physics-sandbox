export enum SandboxObjectType {
  Box = "Box",
  Circle = "Circle",
  Triangle = "Triangle",
  Pentagon = "Pentagon",
  Oval = "Oval",
  Platform = "Platform",
  Wall = "Wall",
  Ramp = "Ramp",
}

export enum SandboxObjectFlags {
  None = 0,
  Hidden = 1 << 0,
  Locked = 1 << 1,
}
