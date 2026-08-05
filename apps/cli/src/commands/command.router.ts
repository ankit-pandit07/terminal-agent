import { ConversationManager } from "../conversation/conversation.manager.js";
import { ClearCommand } from "./clear.command.js";
import { CLICommand } from "./command.interface.js";
import { HelpCommand } from "./help.command.js";
import { NewCommand } from "./new.command.js";
import { SessionCommand } from "./session.command.js";
import { VersionCommand } from "./version.command.js";
import { HistoryCommand } from "./history.command.js";
import { ResumeCommand } from "./resume.command.js";

export class CommandRouter {
  private commands = new Map<string, CLICommand>();

  constructor(private manager:ConversationManager) {
    this.register(new HelpCommand());
    this.register(new ClearCommand());
    this.register(new VersionCommand());

    this.register(new SessionCommand(this.manager))
    this.register(new NewCommand(manager));
    this.register(new HistoryCommand());
    this.register(new ResumeCommand(manager))
  }

  private register(command:CLICommand){
    this.commands.set(command.name, command);
  }

  async handle(input: string): Promise<boolean> {
    const [name, ...args]= input.trim().split(/\s+/);

    const command = this.commands.get(name.toLowerCase());

    if (!command) {
      return false;
    }

    await command.execute(args);

    return true;
  }
}