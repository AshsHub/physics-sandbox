// abstractions/IApplication.ts

import type { Vector2 } from "../app/Vector2";
import type { ICommandBus } from "./ICommands";
import type { IEventBus } from "./IEventBus";
import type { ISandboxEngine } from "./ISandboxEngine";

export interface IApplication {
  commands: ICommandBus;
  engine: ISandboxEngine;
  events: IEventBus;

  update(): void;
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void;
  pointerDown(pos: Vector2): void;
  pointerMove(pos: Vector2): void;
  pointerUp(): void;
}
