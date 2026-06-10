import type { SandboxEngine } from "../engine/SandboxEngine";
import type { ISandboxObject } from "../sandbox/SandboxObject";
import type { ICommand, ICommandResult } from "./ICommands";

export interface UpdateObjectPropertiesCommandOptions {
  objectIds: string[];
  property: keyof ISandboxObject;
  value: unknown;
}

export class UpdateObjectPropertiesCommand implements ICommand {
  private readonly _previousValues = new Map<string, unknown>();

  public constructor(
    private readonly _engine: SandboxEngine,
    private readonly _options: UpdateObjectPropertiesCommandOptions,
  ) {}

  public execute(): ICommandResult {
    if (this._options.objectIds.length === 0) {
      return {
        success: false,
        message: "No objects were provided to update.",
      };
    }

    const objects = this._options.objectIds
      .map((id) => this._engine.getObject(id))
      .filter((object): object is ISandboxObject => object !== undefined);

    if (objects.length === 0) {
      return {
        success: false,
        message: "No matching objects were found to update.",
      };
    }

    for (const object of objects) {
      if (!this._previousValues.has(object.id)) {
        this._previousValues.set(
          object.id,
          clonePropertyValue(object[this._options.property]),
        );
      }

      this._engine.updateObjectProperty(
        object.id,
        this._options.property,
        this._options.value as never,
      );
    }

    return {
      success: true,
    };
  }

  public undo(): ICommandResult {
    if (this._previousValues.size === 0) {
      return {
        success: false,
        message: "Cannot undo update before previous values are known.",
      };
    }

    for (const [id, previousValue] of this._previousValues) {
      this._engine.updateObjectProperty(
        id,
        this._options.property,
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

function clonePropertyValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return [...value];
  }

  if (value && typeof value === "object") {
    return {
      ...value,
    };
  }

  return value;
}
