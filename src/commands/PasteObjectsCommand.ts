import type { ISandboxEngine } from "../engine/ISandboxEngine";
import { Vector2 } from "../maths/Vector2";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { useEditorStore } from "../store/editorStore";
import type { ICommand, ICommandResult } from "./ICommands";

export interface PasteObjectsCommandOptions {
  offset: Vector2;
  snapshots: ISandboxObjectSnapshot[];
}

export class PasteObjectsCommand implements ICommand {
  private readonly _createdSnapshots: ISandboxObjectSnapshot[] = [];

  public constructor(
    private readonly _engine: ISandboxEngine,
    private readonly _options: PasteObjectsCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this._options.snapshots.length === 0) {
      return {
        success: false,
        message: "No copied objects were available to paste.",
      };
    }

    if (this._createdSnapshots.length === 0) {
      this._createdSnapshots.push(
        ...this._options.snapshots.map((snapshot) =>
          this._createPastedSnapshot(snapshot),
        ),
      );
    }

    for (const snapshot of this._createdSnapshots) {
      this._engine.createObjectFromSnapshot(snapshot);
    }

    useEditorStore
      .getState()
      .setSelection(this._createdSnapshots.map((snapshot) => snapshot.id));

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this._createdSnapshots.length === 0) {
      return {
        success: false,
        message: "Cannot undo paste without created object snapshots.",
      };
    }

    this._engine.destroyObject(
      this._createdSnapshots.map((snapshot) => snapshot.id),
    );

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }

  private _createPastedSnapshot(
    snapshot: ISandboxObjectSnapshot,
  ): ISandboxObjectSnapshot {
    return {
      id: crypto.randomUUID(),
      name: `${snapshot.name} Copy`,
      type: snapshot.type,
      position: snapshot.position.clone().add(this._options.offset),
      angle: snapshot.angle,
      flags: snapshot.flags,
      metadata: {
        ...snapshot.metadata,
      },
    };
  }
}
