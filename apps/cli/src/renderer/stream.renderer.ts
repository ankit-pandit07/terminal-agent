import chalk from "chalk";
import type { StreamEvent } from "../types/stream-event.js";

export class StreamRenderer {
  render(event: StreamEvent): void {
    switch (event.type) {
      case "planning":
        console.log();
        console.log(chalk.blue("Planning"));
        console.log(chalk.gray(event.message));
        break;

      case "plan-created":
        console.log();
        console.log(chalk.green(`Plan Created (${event.steps} step${event.steps > 1 ? "s" : ""})`));
        break;

      case "tool-start":
        console.log();
        console.log(chalk.yellow(`Running ${event.tool}...`));
        break;

      case "tool-complete":
        if (event.success) {
          console.log(chalk.green(`${event.tool} completed`));
        } else {
          console.log(chalk.red(`${event.tool} failed`));
        }
        break;

      case "goal":
        console.log();
        console.log(chalk.magenta("Goal Evaluation"));

        console.log(
          `Completed : ${
            event.goal.completed
              ? chalk.green("Yes")
              : chalk.red("No")
          }`,
        );

        console.log(
          `Confidence : ${Math.round(event.goal.confidence * 100)}%`,
        );

        console.log(`Reason : ${event.goal.reason}`);
        break;

      case "completed":
        console.log();
        console.log(chalk.green("Completed"));
        console.log();
        console.log(chalk.cyan("Response"));
        console.log("--------------------------------");
        console.log(event.response);
        break;

      case "error":
        console.log();
        console.log(chalk.red("Error"));
        console.log(event.message);
        break;
    }
  }
}