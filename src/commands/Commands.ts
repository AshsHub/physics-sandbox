import { SandboxEngine } from "../engine/SandboxEngine";
import type { Camera } from "../camera/Camera";
import { CreateObjectCommand } from "./CreateObjectCommand";
import { DeleteObjectCommand } from "./DeleteObjectCommand";
import { PasteObjectsCommand } from "./PasteObjectsCommand";
import { SpawnPrefabCommand } from "./SpawnPrefabCommand";
import type {
  CommandAction,
  CommandLogEntry,
  ICommand,
  ICommandBus,
  ICommandMap,
  ICommandResult,
} from "./ICommands";
import { UpdateObjectPropertiesCommand } from "./UpdateObjectPropertiesCommand";

type CommandFactoryMap = {
  [K in keyof ICommandMap]: (options: ICommandMap[K]) => ICommand;
};

interface CommandHistoryEntry {
  id: number;
  type: keyof ICommandMap;
  command: ICommand;
}

export class Commands implements ICommandBus {
  private readonly _history: CommandHistoryEntry[] = [];
  private readonly _log: CommandLogEntry[] = [];
  private _historyIndex = -1;
  private _nextCommandId = 1;
  private _nextLogId = 1;

  private readonly _commandMap: CommandFactoryMap = {
    updateObjectProperties: (options) =>
      new UpdateObjectPropertiesCommand(this._engine, options),
    createObject: (options) =>
      new CreateObjectCommand(this._engine, this._camera, options),
    deleteObject: (options) => new DeleteObjectCommand(this._engine, options),
    pasteObjects: (options) => new PasteObjectsCommand(this._engine, options),
    spawnPrefab: (options) => new SpawnPrefabCommand(this._engine, options),
  };

  public constructor(
    private readonly _engine: SandboxEngine,
    private readonly _camera: Camera,
  ) {}

  public execute<T extends keyof ICommandMap>(
    type: T,
    options: ICommandMap[T],
  ): ICommandResult {
    const factory = this._commandMap[type];

    const command = factory(options);
    const commandId = this._nextCommandId++;
    const result = this._runCommand(type, "execute", commandId, () =>
      command.execute(),
    );

    if (!result.success) {
      return result;
    }

    if (this._historyIndex < this._history.length - 1) {
      this._history.splice(this._historyIndex + 1);
    }

    this._history.push({
      id: commandId,
      type,
      command,
    });

    this._historyIndex++;

    return result;
  }

  public undo(): ICommandResult {
    const entry = this._history[this._historyIndex];

    if (!entry) {
      return {
        success: false,
        message: "No command to undo.",
      };
    }

    const result = this._runCommand(entry.type, "undo", entry.id, () =>
      entry.command.undo(),
    );

    if (!result.success) {
      return result;
    }

    this._historyIndex--;

    return result;
  }

  public redo(): ICommandResult {
    const entry = this._history[this._historyIndex + 1];

    if (!entry) {
      return {
        success: false,
        message: "No command to redo.",
      };
    }

    const result = this._runCommand(entry.type, "redo", entry.id, () =>
      entry.command.redo(),
    );

    if (!result.success) {
      return result;
    }

    this._historyIndex++;

    return result;
  }

  public getLog(): CommandLogEntry[] {
    return [...this._log];
  }

  private _runCommand(
    type: keyof ICommandMap,
    action: CommandAction,
    commandId: number,
    run: () => ICommandResult,
  ): ICommandResult {
    let result: ICommandResult;

    try {
      result = run();
    } catch (error) {
      result = {
        success: false,
        message: error instanceof Error ? error.message : "Command failed.",
      };
    }

    this._logCommand(type, action, commandId, result);

    return result;
  }

  private _logCommand(
    command: keyof ICommandMap,
    action: CommandAction,
    commandId: number,
    result: ICommandResult,
  ): void {
    const entry: CommandLogEntry = {
      id: this._nextLogId++,
      commandId,
      command,
      action,
      success: result.success,
      message: result.message,
      timestamp: Date.now(),
    };

    this._log.push(entry);

    console.info(
      `[command:${entry.commandId}] ${entry.action} ${entry.command} ${entry.success ? "succeeded" : "failed"}`,
      entry,
    );
  }
}
