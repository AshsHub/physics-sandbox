import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const rubeGoldbergPrefab: SerializedSandboxPrefab = {
  id: "rube-goldberg",
  name: "Rube Goldberg Machine",
  description:
    "A multi-stage chain reaction with ramps, platforms, blockers, radial forces, and a final ball drop.",
  objects: [
    {
      name: "Launch Ramp",
      type: "Ramp",
      offset: {
        x: -573.3091,
        y: -389.0949,
      },
      angle: 0.48,
      metadata: {
        width: 300,
        height: 15,
      },
    },
    {
      name: "First Catch Platform",
      type: "Platform",
      offset: {
        x: -419.235,
        y: -320.4529,
      },
      metadata: {
        width: 50,
        height: 15,
      },
    },
    {
      name: "Starter Block",
      type: "Box",
      offset: {
        x: -400.5167,
        y: -354.3765,
      },
      angle: 7.8575,
      metadata: {
        mass: 25,
      },
    },
    {
      name: "Transfer Platform",
      type: "Platform",
      offset: {
        x: -139.7734,
        y: 22.5821,
      },
    },
    {
      name: "Triangle Deflector",
      type: "Triangle",
      offset: {
        x: -147.6967,
        y: -0.1922,
      },
      angle: -0.5187,
      metadata: {
        mass: 100,
        bounce: 0,
        friction: 1,
        width: 35,
        height: 35,
      },
    },
    {
      name: "Left Gate Post",
      type: "Wall",
      offset: {
        x: -39.6707,
        y: -150.7317,
      },
      metadata: {
        width: 10,
      },
    },
    {
      name: "Right Gate Post",
      type: "Wall",
      offset: {
        x: -14.0925,
        y: -112.8475,
      },
      metadata: {
        width: 10,
        height: 300,
      },
    },
    {
      name: "Gate Block Left",
      type: "Box",
      offset: {
        x: -28.2556,
        y: -141.7941,
      },
      angle: -0.0083,
      metadata: {
        width: 10,
        height: 250,
      },
    },
    {
      name: "Gate Block Right",
      type: "Box",
      offset: {
        x: -173.5936,
        y: -28.9106,
      },
      angle: -2.9993,
      metadata: {
        width: 300,
        height: 10,
      },
    },
    {
      name: "Rolling Oval",
      type: "Oval",
      offset: {
        x: -2.1541,
        y: -282.3292,
      },
      angle: 18.8677,
      metadata: {
        mass: 1,
        bounce: 0,
        friction: 1,
        height: 35,
      },
    },
    {
      name: "Mid Catch Platform",
      type: "Platform",
      offset: {
        x: 5.5508,
        y: -254.8023,
      },
      metadata: {
        width: 50,
        height: 15,
      },
    },
    {
      name: "Lower Repulsor",
      type: "WhiteHole",
      offset: {
        x: 93.7013,
        y: 72.7574,
      },
      metadata: {
        radialForceRadius: 100,
        radialForceStrength: 0.01,
      },
    },
    {
      name: "Upper Repulsor",
      type: "WhiteHole",
      offset: {
        x: 376.1805,
        y: 189.4762,
      },
      metadata: {
        radialForceRadius: 100,
        radialForceStrength: 0.01,
      },
    },
    {
      name: "Drop Platform",
      type: "Platform",
      offset: {
        x: 606.0929,
        y: 357.8259,
      },
      metadata: {
        width: 100,
        height: 10,
      },
    },
    {
      name: "Left Funnel Ramp",
      type: "Ramp",
      offset: {
        x: 542.7721,
        y: 340.1099,
      },
      angle: 0.829,
      metadata: {
        width: 50,
        height: 10,
      },
    },
    {
      name: "Right Funnel Ramp",
      type: "Ramp",
      offset: {
        x: 671.8309,
        y: 342.204,
      },
      angle: 2.3998,
      metadata: {
        width: 50,
        height: 10,
      },
    },
    {
      name: "Exit Ramp",
      type: "Ramp",
      offset: {
        x: -313.2101,
        y: 250.6875,
      },
      angle: 0.6545,
      metadata: {
        width: 500,
      },
    },
    {
      name: "Landing Shelf Left",
      type: "Platform",
      offset: {
        x: -93.9274,
        y: 402.3726,
      },
      metadata: {
        width: 150,
      },
    },
    {
      name: "Landing Shelf Center",
      type: "Platform",
      offset: {
        x: 13.9193,
        y: 451.5007,
      },
      metadata: {
        width: 150,
      },
    },
    {
      name: "Landing Shelf Right",
      type: "Platform",
      offset: {
        x: 124.2081,
        y: 436.3362,
      },
      angle: 0.3491,
      metadata: {
        width: 150,
      },
    },
    {
      name: "Gravity Puller",
      type: "Sun",
      offset: {
        x: 260.9534,
        y: 346.8181,
      },
      metadata: {
        radialForceRadius: 150,
        radialForceStrength: 0.004,
      },
    },
    {
      name: "Final Platform",
      type: "Platform",
      offset: {
        x: 424.8469,
        y: 510.2405,
      },
      metadata: {
        width: 100,
        height: 10,
      },
    },
    {
      name: "Final Left Ramp",
      type: "Ramp",
      offset: {
        x: 361.5261,
        y: 492.5245,
      },
      angle: 0.829,
      metadata: {
        width: 50,
        height: 10,
      },
    },
    {
      name: "Final Right Ramp",
      type: "Ramp",
      offset: {
        x: 490.5849,
        y: 494.6186,
      },
      angle: 2.3998,
      metadata: {
        width: 50,
        height: 10,
      },
    },
    {
      name: "Trigger Ball",
      type: "Circle",
      offset: {
        x: -671.8309,
        y: -490.2405,
      },
      angle: 1.5246,
      metadata: {
        mass: 10,
        friction: 0,
      },
    },
  ],
};
