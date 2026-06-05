import type { CreateObjectCommandOptions } from "./CreateObjectCommand";
import type { DeleteObjectCommandOptions } from "./DeleteObjectCommand";
import type { RenameObjectCommandOptions } from "./RenameObjectCommand";
import type { UpdateObjectPropertiesCommandOptions } from "./UpdateObjectPropertiesCommand";

export interface ICommandBus {
  execute<T extends keyof ICommandMap>(
    command: T,
    options: ICommandMap[T],
  ): ICommandResult;
  undo(): ICommandResult;
  redo(): ICommandResult;
  getLog(): CommandLogEntry[];
}

export interface ICommand {
  execute(): ICommandResult;
  undo(): ICommandResult;
  redo(): ICommandResult;
}

export interface ICommandMap {
  updateObjectProperties: UpdateObjectPropertiesCommandOptions;
  createObject: CreateObjectCommandOptions;
  deleteObject: DeleteObjectCommandOptions;
  renameObject: RenameObjectCommandOptions;
}

export type CommandAction = "execute" | "undo" | "redo";

export interface ICommandResult {
  success: boolean;
  message?: string;
}

export interface CommandLogEntry {
  id: number;
  commandId?: number;
  command: keyof ICommandMap;
  action: CommandAction;
  success: boolean;
  message?: string;
  timestamp: number;
}
