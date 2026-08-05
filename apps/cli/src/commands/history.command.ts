import chalk from "chalk";
import { HistoryService } from "../services/history.service.js";
import type { CLICommand } from "./command.interface.js";

export class HistoryCommand implements CLICommand {
  name = "history";

  description = "Show conversation history";

  private service = new HistoryService();

  async execute(): Promise<void> {
    const history = await this.service.getHistory();

    console.log();
    console.log(chalk.cyan("Conversation History"));
    console.log("----------------------------");

    if (history.length === 0) {
      console.log("No conversations found.");
      return;
    }

    history.forEach((conversation, index) => {
      console.log(`${index + 1}. ${conversation.title}`);
      console.log(`   ${conversation.id}`);
      console.log();
    });
  }
}