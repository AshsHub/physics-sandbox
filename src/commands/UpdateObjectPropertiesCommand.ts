import type { SandboxEngine } from "../engine/SandboxEngine";
import type { ISandboxObject } from "../sandbox/SandboxObject";
import type { ICommand, ICommandResult } from "./ICommands";

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

  public execute(): ICommandResult {
    const object = this.engine.getObject(this.options.objectId);

    if (!object) {
      return {
        success: false,
        message: `Object ${this.options.objectId} was not found.`,
      };
    }

    this.previousValue = object[this.options.property];

    object[this.options.property] = this.options.value as never;

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    const object = this.engine.getObject(this.options.objectId);

    if (!object) {
      return {
        success: false,
        message: `Object ${this.options.objectId} was not found.`,
      };
    }

    object[this.options.property] = this.previousValue as never;

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }
}
