import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import type { ICommand } from "./ICommands";

export interface DeleteObjectCommandOptions {
  ids: string[];
}

export class DeleteObjectCommand implements ICommand {
  private snapshots: ISandboxObjectSnapshot[] = [];

  public constructor(
    private readonly engine: ISandboxEngine,
    private readonly options: DeleteObjectCommandOptions,
  ) {}

  public execute(): void {
    if (this.snapshots.length === 0) {
      for (const id of this.options.ids) {
        const snapshot = this.engine.createSnapshot(id);

        if (snapshot) {
          this.snapshots.push(snapshot);
        }
      }
    }

    this.engine.destroyObject(this.snapshots.map((snapshot) => snapshot.id));
  }

  public undo(): void {
    for (const snapshot of this.snapshots) {
      this.engine.createObjectFromSnapshot(snapshot);
    }
  }

  public redo(): void {
    this.execute();
  }
}
