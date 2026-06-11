import { SandboxObjectType } from "../sandbox/SandboxObjectType";

export interface CreatorShapeAction {
  label: string;
  type: SandboxObjectType;
  preview: string;
}

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
    label: "Ramp",
    type: SandboxObjectType.Ramp,
    preview: "ramp",
  },
];

export function getCreatorShapePreview(type: SandboxObjectType): string {
  return (
    [...dynamicShapes, ...staticShapes].find((shape) => shape.type === type)
      ?.preview ?? "box"
  );
}
