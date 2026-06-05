// abstractions/ICommandBus.ts

import type { SandboxObjectType } from "../sandbox/SandboxObject";

export interface ICommandBus {
  createSceneObject(type: SandboxObjectType): void;
}
