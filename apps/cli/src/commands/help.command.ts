import chalk from "chalk";
import type { CLICommand } from "./command.interface.js";

export class HelpCommand implements CLICommand {
  name = "help";

  description = "Show available commands";

  async execute(): Promise<void> {
    console.log();

    console.log(chalk.cyan(" NodeBase Commands"));

    console.log("--------------------------------");

    console.log("help      Show this help");

    console.log("clear     Clear terminal");

    console.log("version   Show CLI version");

    console.log("exit      Exit NodeBase");

    console.log();

    console.log(chalk.green("Any other text will be sent to the AI Agent."));
  }
}