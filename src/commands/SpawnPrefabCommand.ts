import type { ISandboxEngine } from "../engine/ISandboxEngine";
import { Vector2 } from "../maths/Vector2";
import type { SandboxPrefab } from "../prefabs/SandboxPrefabs";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { buildSnapshot } from "../sandbox/SandboxObjectSnapshotUtils";
import type { ICommand, ICommandResult } from "./ICommands";

export interface SpawnPrefabCommandOptions {
  position: Vector2;
  prefab: SandboxPrefab;
}

export class SpawnPrefabCommand implements ICommand {
  private readonly _createdSnapshots: ISandboxObjectSnapshot[] = [];

  public constructor(
    private readonly _engine: ISandboxEngine,
    private readonly _options: SpawnPrefabCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this._options.prefab.objects.length === 0) {
      return {
        success: false,
        message: "Prefab has no objects to spawn.",
      };
    }

    if (this._createdSnapshots.length === 0) {
      this._createdSnapshots.push(
        ...this._options.prefab.objects.map((object) =>
          buildSnapshot({
            ...object,
            position: this._options.position.clone().add(object.offset),
          }),
        ),
      );
    }

    for (const snapshot of this._createdSnapshots) {
      this._engine.createObjectFromSnapshot(snapshot);
    }

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this._createdSnapshots.length === 0) {
      return {
        success: false,
        message: "Cannot undo prefab spawn without created snapshots.",
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
}
