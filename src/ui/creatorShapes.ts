import { SandboxObjectType } from "../sandbox/SandboxObjectType";
import type { AppIconName } from "./icons/AppIcon";

export interface CreatorShapeAction {
  label: string;
  type: SandboxObjectType;
  preview: AppIconName;
}

export const celestialShapes: CreatorShapeAction[] = [
  {
    label: "Black Hole",
    type: SandboxObjectType.BlackHole,
    preview: "black-hole",
  },
  {
    label: "Sun",
    type: SandboxObjectType.Sun,
    preview: "sun",
  },
  {
    label: "White Hole",
    type: SandboxObjectType.WhiteHole,
    preview: "white-hole",
  },
];

export const dynamicShapes: CreatorShapeAction[] = [
  {
    label: "Box",
    type: SandboxObjectType.Box,
    preview: "box",
  },
  {
    label: "Circle",
    type: SandboxObjectType.Circle,
    preview: "circle",
  },
  {
    label: "Triangle",
    type: SandboxObjectType.Triangle,
    preview: "triangle",
  },
  {
    label: "Pentagon",
    type: SandboxObjectType.Pentagon,
    preview: "pentagon",
  },
  {
    label: "Oval",
    type: SandboxObjectType.Oval,
    preview: "oval",
  },
];

export const staticShapes: CreatorShapeAction[] = [
  {
    label: "Platform",
    type: SandboxObjectType.Platform,
    preview: "platform",
  },
  {
    label: "Wall",
    type: SandboxObjectType.Wall,
    preview: "wall",
  },
  {
    label: "Ramp Left",
    type: SandboxObjectType.RampLeft,
    preview: "ramp-left",
  },
  {
    label: "Ramp Right",
    type: SandboxObjectType.RampRight,
    preview: "ramp-right",
  },
];

export function getCreatorShapePreview(type: SandboxObjectType): string {
  return (
    [...celestialShapes, ...dynamicShapes, ...staticShapes].find(
      (shape) => shape.type === type,
    )?.preview ?? "box"
  );
}
