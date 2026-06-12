import type { VectorLike } from "../maths/Vector2";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";

interface InitialSceneObjectDefinition {
  position: VectorLike;
  type: SandboxObjectType;
}

interface InitialSceneConfiguration {
  objects: readonly InitialSceneObjectDefinition[];
}

export const InitialSceneConfig: InitialSceneConfiguration = {
  objects: [],
};
