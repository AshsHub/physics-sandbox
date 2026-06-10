import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import type { ICommand, ICommandResult } from "./ICommands";

export interface DeleteObjectCommandOptions {
  ids: string[];
}

export class DeleteObjectCommand implements ICommand {
  private _snapshots: ISandboxObjectSnapshot[] = [];

  public constructor(
    private readonly _engine: ISandboxEngine,
    private readonly _options: DeleteObjectCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this._snapshots.length === 0) {
      for (const id of this._options.ids) {
        const snapshot = this._engine.createSnapshot(id);

        if (snapshot) {
          this._snapshots.push(snapshot);
        }
      }
    }

    if (this._snapshots.length === 0) {
      return {
        success: false,
        message: "No matching objects were found to delete.",
      };
    }

    this._engine.destroyObject(this._snapshots.map((snapshot) => snapshot.id));

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this._snapshots.length === 0) {
      return {
        success: false,
        message: "Cannot undo deletion without object snapshots.",
      };
    }

    for (const snapshot of this._snapshots) {
      this._engine.createObjectFromSnapshot(snapshot);
    }

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }
}
