import type { CreateObjectCommandOptions } from "./CreateObjectCommand";
import type { UpdateObjectPropertiesCommandOptions } from "./UpdateObjectPropertiesCommand";

export interface ICommandBus {
  execute<T extends keyof ICommandMap>(
    command: T,
    options: ICommandMap[T],
  ): void;
  undo(): void;
  redo(): void;
}

export interface ICommand {
  execute(): void;
  undo(): void;
  redo(): void;
}

export interface ICommandMap {
  updateObjectProperties: UpdateObjectPropertiesCommandOptions;
  createObject: CreateObjectCommandOptions;
}
