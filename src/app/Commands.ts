// Commands.ts

import type { ICommandBus } from "../abstractions/ICommands";
import { SandboxEngine } from "./SandboxEngine";
import type { SandboxObjectType } from "../sandbox/SandboxObject";
import { Vector2 } from "./Vector2";

export class Commands implements ICommandBus {
  constructor(private engine: SandboxEngine) {}

  createSceneObject(type: SandboxObjectType) {
    this.engine.createObject(new Vector2(200 + Math.random() * 200, 100), type);
  }
}
