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

export const SandboxObjectConfig = {
  bodyGeometry: {
    circleRadius: 25,
    triangleRadius: 32,
    pentagonRadius: 30,
    ovalRadius: 30,
    ovalScaleX: 1.45,
    ovalScaleY: 0.75,
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
    [SandboxObjectType.Platform]: {
      flags: SandboxObjectFlags.Static,
      metadata: {
        width: 240,
        height: 28,
        color: "#565656",
        opacity: 1,
        borderColor: "#8a8a8a",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Platform",
        description: "Static platform body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.None,
      },
    },
    [SandboxObjectType.Wall]: {
      flags: SandboxObjectFlags.Static,
      metadata: {
        width: 36,
        height: 220,
        color: "#5c5c5c",
        opacity: 1,
        borderColor: "#929292",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Wall",
        description: "Static vertical wall body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.None,
      },
    },
    [SandboxObjectType.Ramp]: {
      flags: SandboxObjectFlags.Static,
      metadata: {
        width: 220,
        height: 28,
        color: "#686868",
        opacity: 1,
        borderColor: "#a0a0a0",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Ramp",
        description: "Static angled ramp body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.None,
      },
    },
    [SandboxObjectType.Circle]: {
      flags: SandboxObjectFlags.None,
      metadata: {
        width: 50,
        height: 50,
        color: "#4f8cff",
        opacity: 1,
        borderColor: "#b8d0ff",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Circle",
        description: "Dynamic circular body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.Victim,
      },
    },
    [SandboxObjectType.Triangle]: {
      flags: SandboxObjectFlags.None,
      metadata: {
        width: 64,
        height: 64,
        color: "#f2b84b",
        opacity: 1,
        borderColor: "#ffe1a0",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Triangle",
        description: "Dynamic triangular body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.Victim,
      },
    },
    [SandboxObjectType.Pentagon]: {
      flags: SandboxObjectFlags.None,
      metadata: {
        width: 60,
        height: 60,
        color: "#c17cff",
        opacity: 1,
        borderColor: "#e4c2ff",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Pentagon",
        description: "Dynamic pentagonal body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.Victim,
      },
    },
    [SandboxObjectType.Oval]: {
      flags: SandboxObjectFlags.None,
      metadata: {
        width: 87,
        height: 45,
        color: "#38c8b0",
        opacity: 1,
        borderColor: "#b9fff3",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Oval",
        description: "Dynamic oval body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.Victim,
      },
    },
    [SandboxObjectType.Box]: {
      flags: SandboxObjectFlags.None,
      metadata: {
        width: 50,
        height: 50,
        color: "#7cce83",
        opacity: 1,
        borderColor: "#d6ffd9",
        borderWidth: 1,
        borderStyle: SandboxObjectBorderStyle.Solid,
        label: "Box",
        description: "Dynamic rectangular body",
        ...defaultPhysics,
        ...defaultRadialForce,
        collisionRole: SandboxObjectCollisionRole.Victim,
      },
    },
  } satisfies Record<SandboxObjectType, SandboxObjectDefault>,
} as const;
