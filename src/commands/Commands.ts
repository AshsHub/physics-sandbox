import type { ICommandBus } from "./ICommands";
import { SandboxEngine } from "../engine/SandboxEngine";
import { Vector2 } from "../maths/Vector2";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";

export class Commands implements ICommandBus {
  constructor(private engine: SandboxEngine) {}

  createSandboxObject(type: SandboxObjectType) {
    this.engine.createObject(new Vector2(200 + Math.random() * 200, 100), type);
  }
}
