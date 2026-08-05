import chalk from "chalk";
import { ConversationManager } from "../conversation/conversation.manager.js";
import { CLICommand } from "./command.interface.js";

export class NewCommand implements CLICommand {
    name = "new";
    description = "Start a new conversation";

    constructor(
        private manager: ConversationManager
    ) {}

    async execute(): Promise<void> {
        this.manager.clear();

        console.log();
        console.log(chalk.green("✓ Started a new conversation."));
        console.log();
    }
}