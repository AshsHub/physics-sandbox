import type { SandboxEngine } from "../engine/SandboxEngine";
import type { ISandboxObject } from "../sandbox/SandboxObject";
import type { ICommand } from "./ICommands";

export interface UpdateObjectPropertiesCommandOptions {
  objectId: string;
  property: keyof ISandboxObject;
  value: unknown;
}

export class UpdateObjectPropertiesCommand implements ICommand {
  private previousValue?: unknown;

  public constructor(
    private readonly engine: SandboxEngine,
    private readonly options: UpdateObjectPropertiesCommandOptions,
  ) {}

  public execute(): void {
    const object = this.engine.getObject(this.options.objectId);

    if (!object) {
      return;
    }

    this.previousValue = object[this.options.property];

    object[this.options.property] = this.options.value as never;
  }

  public undo(): void {
    const object = this.engine.getObject(this.options.objectId);

    if (!object) {
      return;
    }

    object[this.options.property] = this.previousValue as never;
  }

  public redo(): void {
    this.execute();
  }
}
