import { SandboxObjectConfig } from "../../config/SandboxObjectConfig";
import {
  SandboxObjectCollisionRole,
  type ISandboxObjectMetadata,
} from "../../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../../sandbox/SandboxObjectType";
import type {
  SerializedSandboxObjectMetadata,
  SerializedSandboxPrefab,
  SerializedSandboxPrefabObject,
} from "../SandboxPrefabs";

const distanceScale = 1.65;
const forceRadiusScale = 1.35;
const forceStrengthScale = 2.25;
const moonSizeScale = 1.6;
const planetSizeScale = 1.8;

export const milkyWayPrefab: SerializedSandboxPrefab = {
  id: "milky-way",
  name: "Milky Way",
  description:
    "A solar-system layout with the Sun at the center, eight major planets, and selected moons. [Best used with gravity reduced or disabled in the simulation panel.]",
  objects: [
    createCelestialObject({
      name: "Sun",
      offset: { x: 0, y: 0 },
      size: 96,
      color: "#f6c453",
      borderColor: "#fff0a8",
      mass: 30,
      radialForceRadius: 260,
      radialForceStrength: 0.0042,
      collisionRole: SandboxObjectCollisionRole.Killer,
    }),
    createCelestialObject({
      name: "Mercury",
      offset: scaledOffset(310, -80),
      size: 30,
      color: "#8a8178",
      borderColor: "#c6beb4",
      mass: 3,
      radialForceRadius: 95,
      radialForceStrength: 0.00055,
    }),
    createCelestialObject({
      name: "Venus",
      offset: scaledOffset(450, 160),
      size: 44,
      color: "#c9974d",
      borderColor: "#f0d29b",
      mass: 6,
      radialForceRadius: 120,
      radialForceStrength: 0.00085,
    }),
    createCelestialObject({
      name: "Earth",
      offset: scaledOffset(585, -210),
      size: 46,
      color: "#2f74c0",
      borderColor: "#7ac88f",
      mass: 6,
      radialForceRadius: 130,
      radialForceStrength: 0.00095,
    }),
    createMoonObject({
      name: "Moon",
      offset: scaledOffset(660, -265),
      size: 18,
      color: "#b8b6ad",
      borderColor: "#e2dfd5",
      radialForceRadius: 60,
      radialForceStrength: 0.00018,
    }),
    createCelestialObject({
      name: "Mars",
      offset: scaledOffset(720, 245),
      size: 38,
      color: "#b65336",
      borderColor: "#f0a07c",
      mass: 4,
      radialForceRadius: 110,
      radialForceStrength: 0.0007,
    }),
    createMoonObject({
      name: "Phobos",
      offset: scaledOffset(770, 210),
      size: 12,
      color: "#8b7666",
      borderColor: "#c4aa94",
      radialForceRadius: 45,
      radialForceStrength: 0.0001,
    }),
    createMoonObject({
      name: "Deimos",
      offset: scaledOffset(675, 295),
      size: 10,
      color: "#9a8472",
      borderColor: "#c9b09a",
      radialForceRadius: 40,
      radialForceStrength: 0.00008,
    }),
    createCelestialObject({
      name: "Jupiter",
      offset: scaledOffset(-850, -235),
      size: 104,
      color: "#c89b6f",
      borderColor: "#f2d0ad",
      mass: 18,
      radialForceRadius: 210,
      radialForceStrength: 0.0026,
    }),
    createMoonObject({
      name: "Io",
      offset: scaledOffset(-740, -300),
      size: 18,
      color: "#d9bd57",
      borderColor: "#ffe78c",
      radialForceRadius: 65,
      radialForceStrength: 0.0002,
    }),
    createMoonObject({
      name: "Europa",
      offset: scaledOffset(-730, -175),
      size: 17,
      color: "#c9c1a8",
      borderColor: "#f1ead4",
      radialForceRadius: 65,
      radialForceStrength: 0.0002,
    }),
    createMoonObject({
      name: "Ganymede",
      offset: scaledOffset(-970, -305),
      size: 22,
      color: "#9c8d7a",
      borderColor: "#d6c9b7",
      radialForceRadius: 75,
      radialForceStrength: 0.00024,
    }),
    createMoonObject({
      name: "Callisto",
      offset: scaledOffset(-990, -160),
      size: 21,
      color: "#796f66",
      borderColor: "#b8aca0",
      radialForceRadius: 75,
      radialForceStrength: 0.00022,
    }),
    createCelestialObject({
      name: "Saturn",
      offset: scaledOffset(-1070, 255),
      size: 92,
      color: "#d8c27a",
      borderColor: "#f4e5ad",
      mass: 15,
      radialForceRadius: 195,
      radialForceStrength: 0.0022,
    }),
    createMoonObject({
      name: "Titan",
      offset: scaledOffset(-940, 315),
      size: 24,
      color: "#c28f45",
      borderColor: "#f0c57e",
      radialForceRadius: 80,
      radialForceStrength: 0.00025,
    }),
    createCelestialObject({
      name: "Uranus",
      offset: scaledOffset(1160, -40),
      size: 62,
      color: "#7fd1d8",
      borderColor: "#c9f8fb",
      mass: 10,
      radialForceRadius: 150,
      radialForceStrength: 0.00145,
    }),
    createCelestialObject({
      name: "Neptune",
      offset: scaledOffset(1390, 230),
      size: 60,
      color: "#365dc7",
      borderColor: "#9db5ff",
      mass: 10,
      radialForceRadius: 150,
      radialForceStrength: 0.0015,
    }),
    createMoonObject({
      name: "Triton",
      offset: scaledOffset(1485, 175),
      size: 18,
      color: "#b9c8d8",
      borderColor: "#e3edf7",
      radialForceRadius: 65,
      radialForceStrength: 0.0002,
    }),
  ],
};

interface CelestialObjectOptions {
  borderColor: string;
  collisionRole?: SandboxObjectCollisionRole;
  color: string;
  mass: number;
  name: string;
  offset: {
    x: number;
    y: number;
  };
  radialForceRadius: number;
  radialForceStrength: number;
  size: number;
}

function createCelestialObject({
  borderColor,
  collisionRole = SandboxObjectCollisionRole.None,
  color,
  mass,
  name,
  offset,
  radialForceRadius,
  radialForceStrength,
  size,
}: CelestialObjectOptions): SerializedSandboxPrefabObject {
  return createSpaceObject({
    borderColor,
    collisionRole,
    color,
    description: `${name} gravity source`,
    mass,
    name,
    offset,
    radialForceRadius,
    radialForceStrength,
    size,
    visualScale: planetSizeScale,
  });
}

function createMoonObject(
  options: Omit<CelestialObjectOptions, "collisionRole" | "mass">,
): SerializedSandboxPrefabObject {
  return createSpaceObject({
    ...options,
    collisionRole: SandboxObjectCollisionRole.None,
    description: `${options.name} moon gravity source`,
    mass: 1,
    visualScale: moonSizeScale,
  });
}

type SpaceObjectOptions = Omit<CelestialObjectOptions, "collisionRole"> & {
  collisionRole: SandboxObjectCollisionRole;
  description: string;
  visualScale: number;
};

function createSpaceObject({
  borderColor,
  collisionRole,
  color,
  description,
  mass,
  name,
  offset,
  radialForceRadius,
  radialForceStrength,
  size,
  visualScale,
}: SpaceObjectOptions): SerializedSandboxPrefabObject {
  return {
    name,
    type: "Circle",
    offset,
    angle: 0,
    flags: SandboxObjectFlags.Static,
    metadata: serializeMetadata({
      ...SandboxObjectConfig.defaults.Circle.metadata,
      width: size * visualScale,
      height: size * visualScale,
      color,
      borderColor,
      label: name,
      description,
      mass,
      radialForceMode: "Pull",
      radialForceRadius: radialForceRadius * forceRadiusScale,
      radialForceStrength: radialForceStrength * forceStrengthScale,
      collisionRole,
    }),
  };
}

function scaledOffset(x: number, y: number): { x: number; y: number } {
  return {
    x: x * distanceScale,
    y: y * distanceScale,
  };
}

function serializeMetadata(
  metadata: Omit<ISandboxObjectMetadata, "borderStyle" | "radialForceMode"> & {
    borderStyle: SerializedSandboxObjectMetadata["borderStyle"];
    radialForceMode: SerializedSandboxObjectMetadata["radialForceMode"];
  },
): SerializedSandboxObjectMetadata {
  return metadata;
}
