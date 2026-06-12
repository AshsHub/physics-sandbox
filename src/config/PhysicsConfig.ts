export const PhysicsConfig = {
  body: {
    frictionStaticMultiplier: 1,
    minimumDynamicMass: 0.1,
    rampAngle: -Math.PI / 8,
  },
  dragging: {
    dynamicFollowStrength: 0.25,
  },
  simulation: {
    fixedTimeStepMs: 1000 / 60,
  },
} as const;
