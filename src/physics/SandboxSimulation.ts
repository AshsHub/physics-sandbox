import { SimulationConfig } from "../config/SimulationConfig";

export enum GravitySimulationType {
  ZeroGravity = "zero_gravity",
  Sun = "sun",
  Mercury = "mercury",
  Venus = "venus",
  Earth = "earth",
  Moon = "moon",
  Mars = "mars",
  Jupiter = "jupiter",
  Saturn = "saturn",
  Uranus = "uranus",
  Neptune = "neptune",
  Pluto = "pluto",
}

export interface GravitySimulationPreset {
  label: string;
  type?: GravitySimulationType;
  gravityMultiplier: number;
}

export const gravitySimulationPresets: GravitySimulationPreset[] = [
  {
    label: "Zero Gravity",
    type: GravitySimulationType.ZeroGravity,
    gravityMultiplier: 0,
  },
  {
    label: "Pluto",
    type: GravitySimulationType.Pluto,
    gravityMultiplier: 0.06,
  },
  {
    label: "Moon",
    type: GravitySimulationType.Moon,
    gravityMultiplier: 0.17,
  },
  {
    label: "Mercury",
    type: GravitySimulationType.Mercury,
    gravityMultiplier: 0.38,
  },
  {
    label: "Mars",
    type: GravitySimulationType.Mars,
    gravityMultiplier: 0.38,
  },
  {
    label: "Venus",
    type: GravitySimulationType.Venus,
    gravityMultiplier: 0.91,
  },
  {
    label: "Uranus",
    type: GravitySimulationType.Uranus,
    gravityMultiplier: 0.92,
  },
  {
    label: "Earth",
    type: GravitySimulationType.Earth,
    gravityMultiplier: 1,
  },
  {
    label: "Saturn",
    type: GravitySimulationType.Saturn,
    gravityMultiplier: 1.06,
  },
  {
    label: "Neptune",
    type: GravitySimulationType.Neptune,
    gravityMultiplier: 1.19,
  },
  {
    label: "Jupiter",
    type: GravitySimulationType.Jupiter,
    gravityMultiplier: 2.34,
  },
  {
    label: "Sun",
    type: GravitySimulationType.Sun,
    gravityMultiplier: 27.9,
  },
];

export interface WindDescriptor {
  label: string;
  direction?: "Left" | "Right";
  strengthPercent: number;
}

export function getGravitySimulationPreset(
  type?: GravitySimulationType,
): GravitySimulationPreset {
  return (
    gravitySimulationPresets.find((preset) => preset.type === type) ??
    gravitySimulationPresets[0]
  );
}

export function getGravityMultiplier(type?: GravitySimulationType): number {
  return getGravitySimulationPreset(type).gravityMultiplier;
}

export function getWindDescriptor(force: number): WindDescriptor {
  const strengthPercent =
    Math.round((Math.abs(force) / SimulationConfig.wind.maxForce) * 1000) / 10;

  if (strengthPercent === 0) {
    return {
      label: "None",
      strengthPercent,
    };
  }

  const direction = force < 0 ? "Left" : "Right";

  return {
    label: getWindStrengthLabel(strengthPercent),
    direction,
    strengthPercent,
  };
}

function getWindStrengthLabel(strengthPercent: number): string {
  if (strengthPercent < 20) {
    return "Light Breeze";
  }

  if (strengthPercent < 45) {
    return "Mild Wind";
  }

  if (strengthPercent < 70) {
    return "Gusty Wind";
  }

  if (strengthPercent < 90) {
    return "Strong Wind";
  }

  return "Storm Force";
}
