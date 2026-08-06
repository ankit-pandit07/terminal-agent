import chalk from "chalk";
import ora from "ora";

import { StreamRenderer } from "../renderer/stream.renderer.js";
import { StreamService } from "../services/stream.service.js";
import { ConversationManager } from "../conversation/conversation.manager.js";

export async function runSingleCommand(
  message: string,
) {
  const stream = new StreamService();

  const renderer = new StreamRenderer();

  const manager = new ConversationManager();

  const spinner = ora("Connecting to NodeBase AI...").start();

  try {
    await stream.stream(
      {
        message,
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
}