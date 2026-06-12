import type { Camera } from "../camera/Camera";
import type { ISandboxEngine } from "../engine/ISandboxEngine";
import { Vector2 } from "../maths/Vector2";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";
import type { ICommand, ICommandResult } from "./ICommands";

export interface CreateObjectCommandOptions {
  type: SandboxObjectType;
  position?: Vector2;
  angle?: number;
}

export class CreateObjectCommand implements ICommand {
  private _snapshot?: ISandboxObjectSnapshot;

  public constructor(
    private readonly _engine: ISandboxEngine,
    private readonly _camera: Camera,
    private readonly _options: CreateObjectCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this._snapshot) {
      this._engine.createObjectFromSnapshot(this._snapshot);
      return {
        success: true,
      };
    }

    const object = this._engine.createObject(
      this._options.position ??
        this._camera.getViewportCenterPosition().subtract(0, 200),
      this._options.type,
      this._options.angle,
    );
    const snapshot = this._engine.generateSnapshot(object.id);

    if (!snapshot) {
      return {
        success: false,
        message: "Object was created but its snapshot could not be resolved.",
      };
    }

    this._snapshot = snapshot;

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (!this._snapshot) {
      return {
        success: false,
        message: "Cannot undo object creation before the object exists.",
      };
    }

    this._engine.destroyObject(this._snapshot.id);

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }
}
