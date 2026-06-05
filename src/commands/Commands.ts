import { SandboxEngine } from "../engine/SandboxEngine";
import { CreateObjectCommand } from "./CreateObjectCommand";
import type { ICommand, ICommandBus, ICommandMap } from "./ICommands";
import { UpdateObjectPropertiesCommand } from "./UpdateObjectPropertiesCommand";

type CommandFactoryMap = {
  [K in keyof ICommandMap]: (options: ICommandMap[K]) => ICommand;
};

export class Commands implements ICommandBus {
  private readonly history: ICommand[] = [];
  private historyIndex = -1;

  private readonly commandMap: CommandFactoryMap = {
    updateObjectProperties: (options) =>
      new UpdateObjectPropertiesCommand(this.engine, options),
    createObject: (options) => new CreateObjectCommand(this.engine, options),
  };

  public constructor(private readonly engine: SandboxEngine) {}

  public execute<T extends keyof ICommandMap>(
    type: T,
    options: ICommandMap[T],
  ): void {
    const factory = this.commandMap[type];

    const command = factory(options);

    command.execute();

    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    this.history.push(command);

    this.historyIndex++;
  }

  public undo(): void {
    const command = this.history[this.historyIndex];

    if (!command) {
      return;
    }

    command.undo();

    this.historyIndex--;
  }

  public redo(): void {
    const command = this.history[this.historyIndex + 1];

    if (!command) {
      return;
    }

    command.redo();

    this.historyIndex++;
  }
}
