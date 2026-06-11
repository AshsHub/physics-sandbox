import { describe, expect, it } from "@jest/globals";
import { SimulationConfig } from "../config/SimulationConfig";
import {
  getGravityMultiplier,
  getGravitySimulationPreset,
  getWindDescriptor,
  GravitySimulationType,
  gravitySimulationPresets,
} from "./SandboxSimulation";

describe("SandboxSimulation", () => {
  it("keeps gravity presets ordered from zero gravity to the sun", () => {
    expect(gravitySimulationPresets[0]).toMatchObject({
      label: "Zero Gravity",
      gravityMultiplier: 0,
      type: GravitySimulationType.ZeroGravity,
    });
    expect(gravitySimulationPresets.at(-1)).toMatchObject({
      label: "Sun",
      type: GravitySimulationType.Sun,
    });
  });

  it("finds gravity presets and falls back to zero gravity", () => {
    expect(getGravitySimulationPreset(GravitySimulationType.Earth)).toMatchObject(
      {
        label: "Earth",
        gravityMultiplier: 1,
      },
    );
    expect(getGravitySimulationPreset(undefined)).toBe(
      gravitySimulationPresets[0],
    );
    expect(getGravityMultiplier(GravitySimulationType.Jupiter)).toBe(2.34);
  });

  it("describes zero, left, and right wind", () => {
    expect(getWindDescriptor(0)).toEqual({
      label: "None",
      strengthPercent: 0,
    });

    expect(getWindDescriptor(-SimulationConfig.wind.maxForce / 2)).toEqual({
      direction: "Left",
      label: "Gusty Wind",
      strengthPercent: 50,
    });

    expect(getWindDescriptor(SimulationConfig.wind.maxForce)).toEqual({
      direction: "Right",
      label: "Storm Force",
      strengthPercent: 100,
    });
  });
});
