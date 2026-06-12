import { SandboxObjectConfig } from "../../config/SandboxObjectConfig";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../../sandbox/SandboxObjectType";
import type { SandboxPrefab } from "../SandboxPrefabs";

export const platformStackPrefab: SandboxPrefab = {
  id: "platform-stack",
  name: "Platform Stack",
  description: "A static platform with three dynamic objects above it.",
  objects: [
    {
      name: "Prefab Platform",
      type: SandboxObjectType.Platform,
      offset: {
        x: 0,
        y: 90,
      },
      angle: 0,
      flags: SandboxObjectFlags.Static,
      metadata: {
        ...SandboxObjectConfig.defaults.Platform.metadata,
      },
    },
    {
      name: "Prefab Box",
      type: SandboxObjectType.Box,
      offset: {
        x: -54,
        y: 20,
      },
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: {
        ...SandboxObjectConfig.defaults.Box.metadata,
      },
    },
    {
      name: "Prefab Circle",
      type: SandboxObjectType.Circle,
      offset: {
        x: 0,
        y: -38,
      },
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: {
        ...SandboxObjectConfig.defaults.Circle.metadata,
      },
    },
    {
      name: "Prefab Triangle",
      type: SandboxObjectType.Triangle,
      offset: {
        x: 58,
        y: 18,
      },
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: {
        ...SandboxObjectConfig.defaults.Triangle.metadata,
      },
    },
  ],
};
