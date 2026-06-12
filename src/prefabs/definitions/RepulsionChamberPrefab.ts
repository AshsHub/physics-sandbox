import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const repulsionChamberPrefab: SerializedSandboxPrefab = {
  id: "repulsion-chamber",
  name: "Repulsion Chamber",
  description:
    "A contained white-hole force source with dynamic test objects around it.",
  objects: [
    {
      name: "Chamber Floor",
      type: "Platform",
      offset: {
        x: 0,
        y: 205,
      },
      metadata: {
        width: 500,
      },
    },
    {
      name: "Chamber Ceiling",
      type: "Platform",
      offset: {
        x: 0,
        y: -205,
      },
      metadata: {
        width: 500,
      },
    },
    {
      name: "Chamber Left Wall",
      type: "Wall",
      offset: {
        x: -260,
        y: 0,
      },
      metadata: {
        height: 430,
      },
    },
    {
      name: "Chamber Right Wall",
      type: "Wall",
      offset: {
        x: 260,
        y: 0,
      },
      metadata: {
        height: 430,
      },
    },
    {
      name: "Repulsor",
      type: "WhiteHole",
      offset: {
        x: 0,
        y: 0,
      },
      metadata: {
        radialForceRadius: 260,
        radialForceStrength: 0.006,
      },
    },
    {
      name: "Repulsion Test 1",
      type: "Circle",
      offset: {
        x: 145,
        y: 0,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 2",
      type: "Box",
      offset: {
        x: 102.5305,
        y: 81.3173,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 3",
      type: "Circle",
      offset: {
        x: 0,
        y: 115,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 4",
      type: "Box",
      offset: {
        x: -102.5305,
        y: 81.3173,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 5",
      type: "Circle",
      offset: {
        x: -145,
        y: 0,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 6",
      type: "Box",
      offset: {
        x: -102.5305,
        y: -81.3173,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 7",
      type: "Circle",
      offset: {
        x: 0,
        y: -115,
      },
      metadata: {
        mass: 3,
      },
    },
    {
      name: "Repulsion Test 8",
      type: "Box",
      offset: {
        x: 102.5305,
        y: -81.3173,
      },
      metadata: {
        mass: 3,
      },
    },
  ],
};
