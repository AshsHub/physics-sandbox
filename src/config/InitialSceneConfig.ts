import type { VectorLike } from "../maths/Vector2";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";

interface InitialSceneObjectDefinition {
  position: VectorLike;
  type: SandboxObjectType;
}

export const InitialSceneConfig = {
  objects: [
    {
      position: {
        x: 0,
        y: 580,
      },
      type: SandboxObjectType.Platform,
    },
  ],
} as const satisfies {
  objects: readonly InitialSceneObjectDefinition[];
};
