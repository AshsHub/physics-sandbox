import { describe, expect, it } from "@jest/globals";
import { Maths } from "./Maths";

describe("Maths", () => {
  it("clamps values to the provided range", () => {
    expect(Maths.clamp(-1, 0, 10)).toBe(0);
    expect(Maths.clamp(11, 0, 10)).toBe(10);
    expect(Maths.clamp(5, 0, 10)).toBe(5);
  });

  it("rounds values to the decimal precision implied by a step", () => {
    expect(Maths.roundToStep(1.234, 0.01)).toBe(1.23);
    expect(Maths.roundToStep(1.236, 0.01)).toBe(1.24);
    expect(Maths.roundToStep(1.6, 1)).toBe(2);
  });
});
