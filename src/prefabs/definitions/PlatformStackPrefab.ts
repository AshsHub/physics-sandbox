import { SandboxObjectConfig } from "../../config/SandboxObjectConfig";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";
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
      angle: 0,
      flags: SandboxObjectFlags.Static,
      metadata: {
        ...SandboxObjectConfig.defaults.Platform.metadata,
        borderStyle: "Solid",
        radialForceMode: "None",
      },
    },
    {
      name: "Prefab Box",
      type: "Box",
      offset: {
        x: -54,
        y: 20,
      },
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: {
        ...SandboxObjectConfig.defaults.Box.metadata,
        borderStyle: "Solid",
        radialForceMode: "None",
      },
    },
    {
      name: "Prefab Circle",
      type: "Circle",
      offset: {
        x: 0,
        y: -38,
      },
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: {
        ...SandboxObjectConfig.defaults.Circle.metadata,
        borderStyle: "Solid",
        radialForceMode: "None",
      },
    },
    {
      name: "Prefab Triangle",
      type: "Triangle",
      offset: {
        x: 58,
        y: 18,
      },
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: {
        ...SandboxObjectConfig.defaults.Triangle.metadata,
        borderStyle: "Solid",
        radialForceMode: "None",
      },
    },
  ],
};
