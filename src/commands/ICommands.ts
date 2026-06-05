import type { SandboxObjectType } from "../sandbox/SandboxObjectType";

export interface ICommandBus {
  createSandboxObject(type: SandboxObjectType): void;
}
