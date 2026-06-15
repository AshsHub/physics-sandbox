import { describe, expect, it } from "@jest/globals";
import { Vector2 } from "./Vector2";

describe("Vector2", () => {
  it("constructs from coordinates, vector-like objects, and static helpers", () => {
    expect(new Vector2(2, 3).toObject()).toEqual({ x: 2, y: 3 });
    expect(new Vector2({ x: 4, y: 5 }).toArray()).toEqual([4, 5]);
    expect(Vector2.zero().toObject()).toEqual({ x: 0, y: 0 });
    expect(Vector2.one().toObject()).toEqual({ x: 1, y: 1 });
  });

  it("mutates and chains arithmetic operations", () => {
    const vector = new Vector2(2, 4)
      .add(1, 2)
      .subtract({ x: 1, y: 1 })
      .multiply(2)
      .divide({ x: 2, y: 5 });

    expect(vector.toObject()).toEqual({ x: 2, y: 2 });
  });

  it("calculates distances and vector products", () => {
    const vector = new Vector2(3, 4);

    expect(vector.length()).toBe(5);
    expect(vector.lengthSquared()).toBe(25);
    expect(vector.distanceTo({ x: 6, y: 8 })).toBe(5);
    expect(vector.distanceSquaredTo(6, 8)).toBe(25);
    expect(vector.dot({ x: 2, y: 3 })).toBe(18);
    expect(vector.cross({ x: 2, y: 3 })).toBe(1);
  });

  it("normalizes non-zero vectors and leaves zero vectors unchanged", () => {
    expect(new Vector2(3, 4).normalize().toObject()).toEqual({
      x: 0.6,
      y: 0.8,
    });
    expect(Vector2.zero().normalize().toObject()).toEqual({ x: 0, y: 0 });
  });

  it("clamps vector length without changing shorter vectors", () => {
    expect(new Vector2(6, 8).clampLength(5).toObject()).toEqual({
      x: 3,
      y: 4,
    });
    expect(new Vector2(3, 4).clampLength(10).toObject()).toEqual({
      x: 3,
      y: 4,
    });
    expect(new Vector2(3, 4).clampLength(0).toObject()).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("clones without sharing references", () => {
    const original = new Vector2(1, 2);
    const clone = original.clone().add(3, 4);

    expect(original.toObject()).toEqual({ x: 1, y: 2 });
    expect(clone.toObject()).toEqual({ x: 4, y: 6 });
  });
});
