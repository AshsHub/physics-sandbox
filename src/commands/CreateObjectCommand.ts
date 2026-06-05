import type { ISandboxEngine } from "../engine/ISandboxEngine";
import { Vector2 } from "../maths/Vector2";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import type { SandboxObjectType } from "../sandbox/SandboxObjectType";
import type { ICommand } from "./ICommands";

export interface CreateObjectCommandOptions {
  type: SandboxObjectType;
  position?: Vector2;
}

export class CreateObjectCommand implements ICommand {
  private snapshot?: ISandboxObjectSnapshot;

  public constructor(
    private readonly engine: ISandboxEngine,
    private readonly options: CreateObjectCommandOptions,
  ) {}

  public execute(): void {
    if (this.snapshot) {
      this.engine.createObjectFromSnapshot(this.snapshot);
      return;
    }

    const object = this.engine.createObject(
      this.options.position ?? new Vector2(200 + Math.random() * 200, 100),
      this.options.type,
    );

    this.snapshot = {
      id: object.id,
      name: object.name,
      type: object.type,
      position: this.engine.getObjectPosition(object.id)!,
    };
  }

  public undo(): void {
    if (!this.snapshot) {
      return;
    }

    this.engine.destroyObject(this.snapshot.id);
  }

  public redo(): void {
    this.execute();
  }
}
