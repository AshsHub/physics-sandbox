export enum SandboxObjectType {
  Box = "Box",
  Circle = "Circle",
  Triangle = "Triangle",
  Pentagon = "Pentagon",
  Oval = "Oval",
  Platform = "Platform",
  Wall = "Wall",
  RampLeft = "RampLeft",
  RampRight = "RampRight",
  Sun = "Sun",
  BlackHole = "BlackHole",
  WhiteHole = "WhiteHole",
}

export enum SandboxObjectFlags {
  None = 0,
  Hidden = 1 << 0,
  Locked = 1 << 1,
  Static = 1 << 2,
}
