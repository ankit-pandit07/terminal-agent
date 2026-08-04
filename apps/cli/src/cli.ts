import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { AgentService } from "./services/agent.service.js";

export function startCLI() {
  const program = new Command();

  const agent = new AgentService();

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
        const result = await agent.chat(message);
console.log("CLI RESULT:");
console.log(result);
        spinner.succeed("Done");

        console.log();
        console.log(chalk.cyan("AI Response"));
        console.log("----------------------------");
        console.log(result.response);
      } catch (error) {
        spinner.fail("Request failed");

        if (error instanceof Error) {
          console.log(chalk.red(error.message));
        }
      }
    });

  program.parse();
}