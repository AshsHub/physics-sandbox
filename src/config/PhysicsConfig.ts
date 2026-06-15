export const PhysicsConfig = {
  body: {
    frictionStaticMultiplier: 1,
    minimumDynamicMass: 0.1,
  },
  dragging: {
    dynamicFollowStrength: 0.25,
    exactVelocityScale: 0.22,
    maxExactVelocity: 18,
    manualRotationLockFrames: 2,
  },
  simulation: {
    fixedTimeStepMs: 1000 / 60,
    substeps: 2,
    positionIterations: 8,
    velocityIterations: 6,
  },
} as const;
