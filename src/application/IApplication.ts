import type { Vector2 } from "../maths/Vector2";
import type { IEventBus } from "../events/IEventBus";
import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { ICommandBus } from "../commands/ICommands";

export interface IApplication {
  commands: ICommandBus;
  engine: ISandboxEngine;
  events: IEventBus;

  update(width: number, height: number): void;
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void;
  pointerDown(pos: Vector2, button: number): void;
  pointerMove(pos: Vector2): void;
  pointerWheel(deltaY: number, pos: Vector2): void;
  pointerUp(button: number): void;
  pointerLeave(): void;
}
