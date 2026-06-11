import {
  type ISandboxObjectMetadata,
  SandboxObjectBorderStyle,
  SandboxObjectCollisionRole,
  SandboxObjectRadialForceMode,
} from "../sandbox/SandboxObject";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";

interface SandboxObjectDefault {
  flags: SandboxObjectFlags;
  metadata: ISandboxObjectMetadata;
}

type SandboxObjectMetadataDefaults = Pick<
  ISandboxObjectMetadata,
  | "bounce"
  | "borderStyle"
  | "borderWidth"
  | "friction"
  | "mass"
  | "opacity"
  | "radialForceMode"
  | "radialForceRadius"
  | "radialForceStrength"
>;

type SandboxObjectMetadataOptions = Omit<
  ISandboxObjectMetadata,
  keyof SandboxObjectMetadataDefaults
> &
  Partial<SandboxObjectMetadataDefaults>;

const defaultPhysics = {
  mass: 1,
  bounce: 0.5,
  friction: 0.6,
} as const;

const defaultRadialForce = {
  radialForceMode: SandboxObjectRadialForceMode.None,
  radialForceRadius: 240,
  radialForceStrength: 0.0012,
} as const;

const defaultMetadata = {
  opacity: 1,
  borderWidth: 1,
  borderStyle: SandboxObjectBorderStyle.Solid,
  ...defaultPhysics,
  ...defaultRadialForce,
} satisfies SandboxObjectMetadataDefaults;

function createMetadata(
  options: SandboxObjectMetadataOptions,
): ISandboxObjectMetadata {
  return {
    ...defaultMetadata,
    ...options,
  };
}

export const SandboxObjectConfig = {
  bodyGeometry: {
    blackHoleRadius: 32,
    circleRadius: 25,
    sunRadius: 30,
    triangleRadius: 32,
    pentagonRadius: 30,
    ovalRadius: 30,
    ovalScaleX: 1.45,
    ovalScaleY: 0.75,
    whiteHoleRadius: 30,
  },
  defaultPhysics: {
    ...defaultPhysics,
  },
  defaultRadialForce: {
    ...defaultRadialForce,
  },
  naming: {
    idPreviewLength: 5,
  },
  metadataConstraints: {
    width: {
      min: 4,
      step: 1,
    },
    height: {
      min: 4,
      step: 1,
    },
    opacity: {
      min: 0,
      max: 1,
      step: 0.05,
    },
    borderWidth: {
      min: 0,
      step: 1,
    },
    mass: {
      min: 0.1,
      fallbackDynamicValue: 10,
      step: 0.1,
    },
    bounce: {
      min: 0,
      max: 1,
      step: 0.05,
    },
    friction: {
      min: 0,
      max: 1,
      step: 0.05,
    },
    radialForceRadius: {
      min: 0,
      step: 10,
    },
    radialForceStrength: {
      min: 0,
      step: 0.0001,
    },
  },
  defaults: {
    [SandboxObjectType.BlackHole]: {
      flags: SandboxObjectFlags.Static,
      metadata: createMetadata({
        width: 64,
        height: 64,
        color: "#2a103f",
        borderColor: "#8f5bd1",
        label: "Black Hole",
        description: "Static circular body with a strong pull force",
        radialForceMode: SandboxObjectRadialForceMode.Pull,
        radialForceRadius: 360,
        radialForceStrength: 0.005,
        collisionRole: SandboxObjectCollisionRole.Killer,
      }),
    },
    [SandboxObjectType.Sun]: {
      flags: SandboxObjectFlags.Static,
      metadata: createMetadata({
        width: 60,
        height: 60,
        color: "#f6c453",
        borderColor: "#fff0a8",
        label: "Sun",
        description: "Static circular body with a strong pull force",
        radialForceMode: SandboxObjectRadialForceMode.Pull,
        radialForceRadius: 340,
        radialForceStrength: 0.0032,
        collisionRole: SandboxObjectCollisionRole.None,
      }),
    },
    [SandboxObjectType.WhiteHole]: {
      flags: SandboxObjectFlags.Static,
      metadata: createMetadata({
        width: 60,
        height: 60,
        color: "#f5f7ff",
        borderColor: "#88b8ff",
        label: "White Hole",
        description: "Static circular body with a strong push force",
        radialForceMode: SandboxObjectRadialForceMode.Push,
        radialForceRadius: 320,
        radialForceStrength: 0.003,
        collisionRole: SandboxObjectCollisionRole.None,
      }),
    },
    [SandboxObjectType.Platform]: {
      flags: SandboxObjectFlags.Static,
      metadata: createMetadata({
        width: 240,
        height: 28,
        color: "#565656",
        borderColor: "#8a8a8a",
        label: "Platform",
        description: "Static platform body",
        collisionRole: SandboxObjectCollisionRole.None,
      }),
    },
    [SandboxObjectType.Wall]: {
      flags: SandboxObjectFlags.Static,
      metadata: createMetadata({
        width: 36,
        height: 220,
        color: "#5c5c5c",
        borderColor: "#929292",
        label: "Wall",
        description: "Static vertical wall body",
        collisionRole: SandboxObjectCollisionRole.None,
      }),
    },
    [SandboxObjectType.Ramp]: {
      flags: SandboxObjectFlags.Static,
      metadata: createMetadata({
        width: 220,
        height: 28,
        color: "#686868",
        borderColor: "#a0a0a0",
        label: "Ramp",
        description: "Static angled ramp body",
        collisionRole: SandboxObjectCollisionRole.None,
      }),
    },
    [SandboxObjectType.Circle]: {
      flags: SandboxObjectFlags.None,
      metadata: createMetadata({
        width: 50,
        height: 50,
        color: "#4f8cff",
        borderColor: "#b8d0ff",
        label: "Circle",
        description: "Dynamic circular body",
        collisionRole: SandboxObjectCollisionRole.Victim,
      }),
    },
    [SandboxObjectType.Triangle]: {
      flags: SandboxObjectFlags.None,
      metadata: createMetadata({
        width: 64,
        height: 64,
        color: "#f2b84b",
        borderColor: "#ffe1a0",
        label: "Triangle",
        description: "Dynamic triangular body",
        collisionRole: SandboxObjectCollisionRole.Victim,
      }),
    },
    [SandboxObjectType.Pentagon]: {
      flags: SandboxObjectFlags.None,
      metadata: createMetadata({
        width: 60,
        height: 60,
        color: "#c17cff",
        borderColor: "#e4c2ff",
        label: "Pentagon",
        description: "Dynamic pentagonal body",
        collisionRole: SandboxObjectCollisionRole.Victim,
      }),
    },
    [SandboxObjectType.Oval]: {
      flags: SandboxObjectFlags.None,
      metadata: createMetadata({
        width: 87,
        height: 45,
        color: "#38c8b0",
        borderColor: "#b9fff3",
        label: "Oval",
        description: "Dynamic oval body",
        collisionRole: SandboxObjectCollisionRole.Victim,
      }),
    },
    [SandboxObjectType.Box]: {
      flags: SandboxObjectFlags.None,
      metadata: createMetadata({
        width: 50,
        height: 50,
        color: "#7cce83",
        borderColor: "#d6ffd9",
        label: "Box",
        description: "Dynamic rectangular body",
        collisionRole: SandboxObjectCollisionRole.Victim,
      }),
    },
  } satisfies Record<SandboxObjectType, SandboxObjectDefault>,
} as const;
