import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { StreamService } from "./services/stream.service.js";
import { StreamRenderer } from "./renderer/stream.renderer.js";
import { InteractiveShell } from "./interactive/shell.js";
import { printBanner } from "./utils/banner.js";

export function startCLI() {
  const program = new Command();

  const stream = new StreamService();
  const renderer = new StreamRenderer();

  program
    .name("nodebase")
    .description("NodeBase AI Terminal Agent")
    .version("1.0.0")
    .argument("[message]", "Message for AI Agent")
    .action(async (message?: string) => {

      // Single Command Mode
      if (message) {
        const spinner = ora("Connecting to NodeBase AI...").start();

        try {
          await stream.stream(message, (event) => {
            spinner.stop();
            renderer.render(event);
          });
        } catch (error) {
          spinner.fail("Request failed");

          if (error instanceof Error) {
            console.log(chalk.red(error.message));
          }
        }

        return;
      }

      // Interactive Mode
      printBanner();

      const shell = new InteractiveShell();

      while (true) {
        const input = await shell.ask();

        if (!input) {
          continue;
        }

        if (input.toLowerCase() === "exit") {
          console.log(chalk.green("\n Goodbye!\n"));
          shell.close();
          break;
        }

        const spinner = ora("Connecting to NodeBase AI...").start();

        try {
          await stream.stream(input, (event) => {
            spinner.stop();
            renderer.render(event);
          });
        } catch (error) {
          spinner.fail("Request failed");

          if (error instanceof Error) {
            console.log(chalk.red(error.message));
          }
        }

        console.log();
      }
    });

  program.parse();
}