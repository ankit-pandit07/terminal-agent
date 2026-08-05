import { ConversationManager } from "../conversation/conversation.manager.js";
import { ClearCommand } from "./clear.command.js";
import { CLICommand } from "./command.interface.js";
import { HelpCommand } from "./help.command.js";
import { NewCommand } from "./new.command.js";
import { SessionCommand } from "./session.command.js";
import { VersionCommand } from "./version.command.js";

export class CommandRouter {
  private commands = new Map<string, CLICommand>();

  constructor(private manager:ConversationManager) {
    this.register(new HelpCommand());
    this.register(new ClearCommand());
    this.register(new VersionCommand());

    this.register(new SessionCommand(this.manager))
    this.register(new NewCommand(manager));
  }

  private register(command:CLICommand){
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