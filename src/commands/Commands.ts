import { SandboxEngine } from "../engine/SandboxEngine";
import { CreateObjectCommand } from "./CreateObjectCommand";
import { DeleteObjectCommand } from "./DeleteObjectCommand";
import type {
  CommandAction,
  CommandLogEntry,
  ICommand,
  ICommandBus,
  ICommandMap,
  ICommandResult,
} from "./ICommands";
import { RenameObjectCommand } from "./RenameObjectCommand";
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
  private readonly history: CommandHistoryEntry[] = [];
  private readonly log: CommandLogEntry[] = [];
  private historyIndex = -1;
  private nextCommandId = 1;
  private nextLogId = 1;

  private readonly commandMap: CommandFactoryMap = {
    updateObjectProperties: (options) =>
      new UpdateObjectPropertiesCommand(this.engine, options),
    createObject: (options) => new CreateObjectCommand(this.engine, options),
    deleteObject: (options) => new DeleteObjectCommand(this.engine, options),
    renameObject: (options) => new RenameObjectCommand(this.engine, options),
  };

  public constructor(private readonly engine: SandboxEngine) {}

  public execute<T extends keyof ICommandMap>(
    type: T,
    options: ICommandMap[T],
  ): ICommandResult {
    const factory = this.commandMap[type];

    const command = factory(options);
    const commandId = this.nextCommandId++;
    const result = this.runCommand(type, "execute", commandId, () =>
      command.execute(),
    );

    if (!result.success) {
      return result;
    }

    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    this.history.push({
      id: commandId,
      type,
      command,
    });

    this.historyIndex++;

    return result;
  }

  public undo(): ICommandResult {
    const entry = this.history[this.historyIndex];

    if (!entry) {
      return {
        success: false,
        message: "No command to undo.",
      };
    }

    const result = this.runCommand(entry.type, "undo", entry.id, () =>
      entry.command.undo(),
    );

    if (!result.success) {
      return result;
    }

    this.historyIndex--;

    return result;
  }

  public redo(): ICommandResult {
    const entry = this.history[this.historyIndex + 1];

    if (!entry) {
      return {
        success: false,
        message: "No command to redo.",
      };
    }

    const result = this.runCommand(entry.type, "redo", entry.id, () =>
      entry.command.redo(),
    );

    if (!result.success) {
      return result;
    }

    this.historyIndex++;

    return result;
  }

  public getLog(): CommandLogEntry[] {
    return [...this.log];
  }

  private runCommand(
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

    this.logCommand(type, action, commandId, result);

    return result;
  }

  private logCommand(
    command: keyof ICommandMap,
    action: CommandAction,
    commandId: number,
    result: ICommandResult,
  ): void {
    const entry: CommandLogEntry = {
      id: this.nextLogId++,
      commandId,
      command,
      action,
      success: result.success,
      message: result.message,
      timestamp: Date.now(),
    };

    this.log.push(entry);

    console.info(
      `[command:${entry.commandId}] ${entry.action} ${entry.command} ${entry.success ? "succeeded" : "failed"}`,
      entry,
    );
  }
}
