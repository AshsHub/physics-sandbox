import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import type { ICommand, ICommandResult } from "./ICommands";

export interface DeleteObjectCommandOptions {
  ids: string[];
}

export class DeleteObjectCommand implements ICommand {
  private snapshots: ISandboxObjectSnapshot[] = [];

  public constructor(
    private readonly engine: ISandboxEngine,
    private readonly options: DeleteObjectCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this.snapshots.length === 0) {
      for (const id of this.options.ids) {
        const snapshot = this.engine.createSnapshot(id);

        if (snapshot) {
          this.snapshots.push(snapshot);
        }
      }
    }

    if (this.snapshots.length === 0) {
      return {
        success: false,
        message: "No matching objects were found to delete.",
      };
    }

    this.engine.destroyObject(this.snapshots.map((snapshot) => snapshot.id));

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this.snapshots.length === 0) {
      return {
        success: false,
        message: "Cannot undo deletion without object snapshots.",
      };
    }

    for (const snapshot of this.snapshots) {
      this.engine.createObjectFromSnapshot(snapshot);
    }

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }
}
