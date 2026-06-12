import { describe, expect, it } from "@jest/globals";
import { Rect } from "../maths/Rect";
import { sandboxPrefabs } from "./SandboxPrefabs";

describe("SandboxPrefabs", () => {
  it("keeps prefab offsets centered around the spawn position", () => {
    for (const prefab of sandboxPrefabs) {
      const bounds = Rect.fromPoints(
        prefab.objects.map((object) => object.offset),
      );

      if (!bounds) {
        throw new Error(`Prefab ${prefab.id} has no objects.`);
      }

      const center = bounds.center;

      expect(center.x).toBeCloseTo(0);
      expect(center.y).toBeCloseTo(0);
    }
  });
});
