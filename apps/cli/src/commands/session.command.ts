import chalk from "chalk";
import type { CLICommand } from "./command.interface.js";
import { ConversationManager } from "../conversation/index.js";

export class SessionCommand implements CLICommand {
  name = "session";

  description = "Show current conversation";

  constructor(private manager: ConversationManager) {}

  async execute(): Promise<void> {
    console.log();

    console.log(chalk.cyan("Current Session"));

    console.log("----------------------------");

    if (!this.manager.hasConversation()) {
      console.log("No active conversation.");
      return;
    }

    console.log("Conversation ID:", this.manager.getConversationId());

    console.log();
  }
}
