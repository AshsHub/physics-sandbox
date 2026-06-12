import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const solarSandboxPrefab: SerializedSandboxPrefab = {
  id: "solar-sandbox",
  name: "Solar Sandbox",
  description:
    "A smaller Sun, Earth, and Moon gravity setup for focused experimentation. [Tip: Reduce or disable global gravity.]",
  objects: [
    {
      name: "Solar Sandbox Sun",
      type: "Sun",
      offset: {
        x: 0,
        y: 0,
      },
      metadata: {
        radialForceRadius: 330,
        radialForceStrength: 0.004,
      },
    },
    {
      name: "Solar Sandbox Earth",
      type: "Circle",
      offset: {
        x: 390,
        y: -80,
      },
      flags: 4,
      metadata: {
        radialForceMode: "Pull",
        radialForceRadius: 175,
        radialForceStrength: 0.0014,
        width: 80,
        height: 80,
        color: "#2f74c0",
        borderColor: "#7ac88f",
        label: "Earth",
      },
    },
    {
      name: "Solar Sandbox Moon",
      type: "Circle",
      offset: {
        x: 510,
        y: -145,
      },
      flags: 4,
      metadata: {
        radialForceMode: "Pull",
        radialForceRadius: 75,
        radialForceStrength: 0.0003,
        width: 34,
        height: 34,
        color: "#b8b6ad",
        borderColor: "#e2dfd5",
        label: "Moon",
      },
    },
  ],
};
