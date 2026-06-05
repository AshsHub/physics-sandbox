import type { ISandboxEngine } from "../engine/ISandboxEngine";
import type { ICommand, ICommandResult } from "./ICommands";

export interface RenameObjectCommandOptions {
  objectId: string;
  name: string;
}

export class RenameObjectCommand implements ICommand {
  private previousName?: string;

  public constructor(
    private readonly engine: ISandboxEngine,
    private readonly options: RenameObjectCommandOptions,
  ) {}

  public execute(): ICommandResult {
    const object = this.engine.getObject(this.options.objectId);

    if (!object) {
      return {
        success: false,
        message: `Object ${this.options.objectId} was not found.`,
      };
    }

    const nextName = this.options.name.trim();

    if (nextName.length === 0) {
      return {
        success: false,
        message: "Object name cannot be empty.",
      };
    }

    if (object.name === nextName) {
      return {
        success: false,
        message: "Object already has that name.",
      };
    }

    this.previousName = object.name;

    this.engine.renameObject(this.options.objectId, nextName);

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this.previousName === undefined) {
      return {
        success: false,
        message: "Cannot undo rename before the previous name is known.",
      };
    }

    this.engine.renameObject(this.options.objectId, this.previousName);

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    const nextName = this.options.name.trim();

    if (nextName.length === 0) {
      return {
        success: false,
        message: "Object name cannot be empty.",
      };
    }

    this.engine.renameObject(this.options.objectId, nextName);

    return {
      success: true,
    };
  }
}
