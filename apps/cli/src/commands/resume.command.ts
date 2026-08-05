import chalk from "chalk";
import { ConversationManager } from "../conversation/conversation.manager.js";
import { CLICommand } from "./command.interface.js";

export class ResumeCommand implements CLICommand {
  name = "resume";

  description = "Resume a conversation";

  constructor(
    private manager: ConversationManager,
  ) {}

  async execute(args?: string[]): Promise<void> {
    if (!args || args.length === 0) {
      console.log(chalk.yellow("Usage: resume <conversationId>"));
      return;
    }

    const id = args[0];

    this.manager.setConversationId(id);

    console.log();
    console.log(chalk.green("✓ Conversation resumed"));
    console.log("Conversation ID:", id);
    console.log();
  }
}