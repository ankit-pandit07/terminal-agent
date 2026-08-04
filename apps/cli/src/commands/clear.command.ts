import type { CLICommand } from "./command.interface.js";

export class ClearCommand implements CLICommand {
  name = "clear";

  description = "Clear terminal";

  async execute(): Promise<void> {
    console.clear();
  }
}