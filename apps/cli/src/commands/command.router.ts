import { ClearCommand } from "./clear.command.js";
import { HelpCommand } from "./help.command.js";
import { VersionCommand } from "./version.command.js";

export class CommandRouter {
  private commands = new Map();

  constructor() {
    this.register(new HelpCommand());
    this.register(new ClearCommand());
    this.register(new VersionCommand());
  }

  private register(command: {
    name: string;
    execute(): Promise<void>;
  }) {
    this.commands.set(command.name, command);
  }

  async handle(input: string): Promise<boolean> {
    const command = this.commands.get(input.toLowerCase());

    if (!command) {
      return false;
    }

    await command.execute();

    return true;
  }
}