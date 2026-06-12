import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const basicPrefab: SerializedSandboxPrefab = {
  id: "basic-prefab",
  name: "Basic",
  description: "A static platform with dynamic objects above it.",
  objects: [
    {
      name: "Prefab Platform",
      type: "Platform",
      offset: {
        x: -2,
        y: 64,
      },
    },
    {
      name: "Prefab Box",
      type: "Box",
      offset: {
        x: -56,
        y: -6,
      },
    },
    {
      name: "Prefab Circle",
      type: "Circle",
      offset: {
        x: -2,
        y: -64,
      },
    },
    {
      name: "Prefab Triangle",
      type: "Triangle",
      offset: {
        x: 56,
        y: -8,
      },
    },
  ],
};
