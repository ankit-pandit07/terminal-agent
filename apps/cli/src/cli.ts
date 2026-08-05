import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { StreamService } from "./services/stream.service.js";
import { StreamRenderer } from "./renderer/stream.renderer.js";
import { InteractiveShell } from "./interactive/shell.js";
import { printBanner } from "./utils/banner.js";
import { CommandRouter } from "./commands/command.router.js";
import { ConversationManager } from "./conversation/conversation.manager.js";

export function startCLI() {
  const program = new Command();

  const stream = new StreamService();
  const renderer = new StreamRenderer();
  const manager = new ConversationManager();
  const router = new CommandRouter(manager);

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
          await stream.stream(
            {
              message: message,
              conversationId: manager.getConversationId(),
            },
            (event) => {
              spinner.stop();

              if (event.type === "done") {
                manager.setConversationId(event.conversationId);

                return;
              }

              renderer.render(event);
            },
          );
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

        const handled = await router.handle(input);
        if (handled) {
          console.log();
          continue;
        }
        const spinner = ora("Connecting to NodeBase AI...").start();

        try {
          await stream.stream(
            {
              message: input,
              conversationId: manager.getConversationId(),
            },
            (event) => {
              spinner.stop();

              if (event.type === "done") {
                manager.setConversationId(event.conversationId);
                return;
              }

              renderer.render(event);
            },
          );
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
