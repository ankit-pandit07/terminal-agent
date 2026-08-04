import chalk from "chalk";
import type { CLICommand } from "./command.interface.js";

export class VersionCommand implements CLICommand {
  name = "version";

  description = "Show CLI version";

  async execute(): Promise<void> {
    console.log();

    console.log(chalk.green("🚀 NodeBase CLI"));

    console.log("Version : 1.0.0");

    console.log();
  }
}