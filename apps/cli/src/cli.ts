import { runInteractive } from "./interactive/interactive.js";
import { runSingleCommand } from "./single/single-command.js";


export async function startCLI() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    await runSingleCommand(args.join(" "));
    return;
  }

  await runInteractive();
}