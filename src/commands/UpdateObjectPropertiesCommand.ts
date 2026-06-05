import type { SandboxEngine } from "../engine/SandboxEngine";
import type { ISandboxObject } from "../sandbox/SandboxObject";
import type { ICommand, ICommandResult } from "./ICommands";

export interface UpdateObjectPropertiesCommandOptions {
  objectIds: string[];
  property: keyof ISandboxObject;
  value: unknown;
}

export class UpdateObjectPropertiesCommand implements ICommand {
  private readonly previousValues = new Map<string, unknown>();

  public constructor(
    private readonly engine: SandboxEngine,
    private readonly options: UpdateObjectPropertiesCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this.options.objectIds.length === 0) {
      return {
        success: false,
        message: "No objects were provided to update.",
      };
    }

    const objects = this.options.objectIds
      .map((id) => this.engine.getObject(id))
      .filter((object): object is ISandboxObject => object !== undefined);

    if (objects.length === 0) {
      return {
        success: false,
        message: "No matching objects were found to update.",
      };
    }

    for (const object of objects) {
      if (!this.previousValues.has(object.id)) {
        this.previousValues.set(object.id, object[this.options.property]);
      }

      this.engine.updateObjectProperty(
        object.id,
        this.options.property,
        this.options.value as never,
      );
    }

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this.previousValues.size === 0) {
      return {
        success: false,
        message: "Cannot undo update before previous values are known.",
      };
    }

    for (const [id, previousValue] of this.previousValues) {
      this.engine.updateObjectProperty(
        id,
        this.options.property,
        previousValue as never,
      );
    }

    return {
      success: true,
    };
  }

  public redo(): ICommandResult {
    return this.execute();
  }
}
