import type { Vector2 } from "../maths/Vector2";
import type { Camera } from "../camera/Camera";
import type { IEventBus } from "../events/IEventBus";
import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { ICommandBus } from "../commands/ICommands";
import type {
  ClipboardAction,
  ClipboardSelectionAction,
} from "../input/ClipboardAction";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";

export interface IApplication {
  camera: Camera;
  commands: ICommandBus;
  engine: ISandboxEngine;
  events: IEventBus;

  fitView(): void;
  update(): void;
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void;
  pointerDown(pos: Vector2, button: number): void;
  pointerMove(pos: Vector2): void;
  pointerWheel(deltaY: number, pos: Vector2): void;
  pointerUp(button: number): void;
  pointerLeave(): void;
  startObjectPlacement(type: SandboxObjectType): void;

  executeClipboardAction(action: ClipboardAction.Paste): boolean;
  executeClipboardAction(
    action: ClipboardSelectionAction,
    ids?: string[],
  ): boolean;
}
