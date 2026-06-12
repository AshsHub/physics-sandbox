import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const platformStackPrefab: SerializedSandboxPrefab = {
  id: "platform-stack",
  name: "Platform Stack",
  description: "A static platform with three dynamic objects above it.",
  objects: [
    {
      name: "Prefab Platform",
      type: "Platform",
      offset: {
        x: 0,
        y: 90,
      },
    },
    {
      name: "Prefab Box",
      type: "Box",
      offset: {
        x: -54,
        y: 20,
      },
    },
    {
      name: "Prefab Circle",
      type: "Circle",
      offset: {
        x: 0,
        y: -38,
      },
    },
    {
      name: "Prefab Triangle",
      type: "Triangle",
      offset: {
        x: 58,
        y: 18,
      },
    },
  ],
};
