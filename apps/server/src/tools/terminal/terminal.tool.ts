import { execa } from "execa";
import type { Tool, ToolInput, ToolOutput } from "../base/tool.interface.js";
import path from "node:path";
import { SessionState } from "../../session/session.state.js";

export class TerminalTool implements Tool {
  name = "terminal";
readonly info = {
  name: "terminal",
  displayName: "Terminal",
  description: "Execute terminal commands",
  category: "system",

  version: "1.0.0",
  author: "NodeBase",

  enabled: true,

  capabilities: [
    "shell",
    "command",
    "process",
  ],
} as const;
  description = "Execute terminal commands.";
  constructor(private session: SessionState) {}
  async execute(input: ToolInput): Promise<ToolOutput> {
    const command = String(input.command);
    this.session.setLastTool("terminal");
    this.session.addExecutedCommand(command);
    const cwd = this.session.getCurrentDirectory();
    try {
      //Handle cd command manually
      if (command.startsWith("cd ")) {
        const parts = command.split("&&").map((p) => p.trim());
        const cdCommand = parts.shift();
        if (cdCommand) {
          const target = cdCommand.slice(3).trim();

          const newPath = path.resolve(cwd, target);

          this.session.setCurrentDirectory(newPath);
          this.session.addVisitedDirectory(newPath)

          if (parts.length === 0) {
            this.session.clearLastError();
            return {
              success: true,
              data: `Changed directory to ${newPath}`,
            };
          }
          const remainingCommand = parts.join(" && ");
          const { stdout } = await execa(remainingCommand, {
            shell: true,
            cwd: newPath,
          });
          this.session.clearLastError();
          return {
            success: true,
            data: `Changed directory to ${newPath}\n${stdout}`,
          };
        }
      }
      //Handle pwd command
      if (command === "pwd") {
        const currentDirectory = this.session.getCurrentDirectory();
        this.session.clearLastError();
        return {
          success: true,
          data: currentDirectory,
          metadata: {
            command,
            cwd: currentDirectory,
            stdout: currentDirectory,
          },
        };
      }
      const { stdout } = await execa(command, {
        shell: true,
        cwd,
      });
      this.session.clearLastError();
      return {
        success: true,
        data: stdout,
        metadata: {
          command,
          cwd,
          stdout,
        },
      };
    } catch (error: any) {
      this.session.setLastError(error.message);
      return {
        success: false,
        data: error.message,
        metadata: {
          command,
          cwd,
          stderr: error.stderr,
          exitCode: error.exitCode,
        },
      };
    }
  }
}
