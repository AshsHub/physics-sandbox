export const PhysicsConfig = {
  body: {
    frictionStaticMultiplier: 1,
    minimumDynamicMass: 0.1,
  },
  dragging: {
    dynamicFollowStrength: 0.25,
    manualRotationLockFrames: 2,
  },
  simulation: {
    fixedTimeStepMs: 1000 / 60,
  },
} as const;
