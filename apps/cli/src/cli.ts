import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { AgentService } from "./services/agent.service.js";
import { StreamService } from "./services/stream.service.js";
import { StreamRenderer } from "./renderer/stream.renderer.js";

export function startCLI() {
  const program = new Command();

  const stream = new StreamService();
  const renderer = new StreamRenderer();

  program
    .name("nodebase")
    .description("NodeBase AI Terminal Agent")
    .version("1.0.0");

  program
    .argument("[message]", "Message for AI Agent")
    .action(async (message) => {
      if (!message) {
        console.log(chalk.yellow("Please provide a message."));
        return;
      }

      const spinner = ora("Thinking...").start();

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
    });

  program.parse();
}
