import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { Camera } from "../camera/Camera";
import { Vector2 } from "../maths/Vector2";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";
import type { ICommand, ICommandResult } from "./ICommands";

export interface CreateObjectCommandOptions {
  type: SandboxObjectType;
  position?: Vector2;
}

export class CreateObjectCommand implements ICommand {
  private snapshot?: ISandboxObjectSnapshot;

  public constructor(
    private readonly engine: ISandboxEngine,
    private readonly camera: Camera,
    private readonly options: CreateObjectCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this.snapshot) {
      this.engine.createObjectFromSnapshot(this.snapshot);
      return {
        success: true,
      };
    }

    const object = this.engine.createObject(
      this.options.position ??
        this.camera.getViewportCenterPosition().subtract(0, 200),
      this.options.type,
    );
    const position = this.engine.getObjectPosition(object.id);

    if (!position) {
      return {
        success: false,
        message: "Object was created but its position could not be resolved.",
      };
    }

    this.snapshot = {
      id: object.id,
      name: object.name,
      type: object.type,
      position,
      flags: object.flags,
      metadata: {
        ...object.metadata,
      },
    };

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (!this.snapshot) {
      return {
        success: false,
        message: "Cannot undo object creation before the object exists.",
      };
    }

    this.engine.destroyObject(this.snapshot.id);

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }
}
