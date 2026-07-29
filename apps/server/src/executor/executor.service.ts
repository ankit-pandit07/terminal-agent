import { ToolRegistry } from "../tools/base/tool.registry.js";
import { EchoTool } from "../tools/echo/echo.tool.js";
import { TerminalTool } from "../tools/terminal/terminal.tool.js";
import type { ExecutionResult, Executor } from "./executor.js";
import type { Plan } from "../planner/planner.js";
import { CommandGuard } from "../security/command-guard.js";
import { FileTool } from "../tools/file/file.tool.js";
import { DirectoryTool } from "../tools/directory/directory.tool.js";

export class ExecutorService implements Executor {
  private registry = new ToolRegistry();
  private guard = new CommandGuard();

  constructor() {
    this.registry.register(new EchoTool());
    this.registry.register(new TerminalTool());
    this.registry.register(new FileTool());
    this.registry.register(new DirectoryTool());
  }
async execute(plan: Plan): Promise<ExecutionResult> {
  let outputs: string[] = [];

  for (const step of plan.steps) {
    const tool = this.registry.get(step.tool);

    if (!tool) {
      return {
        success: false,
        output: `Tool "${step.tool}" not found`,
      };
    }

    if (step.tool === "terminal") {
      const command = String(step.input.command);

      if (!this.guard.isSafe(command)) {
        return {
          success: false,
          output: "Blocked: Unsafe command detected.",
        };
      }
    }

    const result = await tool.execute(step.input);
    

    if (!result.success) {
      return {
        success: false,
        output: String(result.data),
      };
    }

    outputs.push(String(result.data));
  }

  return {
    success: true,
    output: outputs.join("\n"),
  };
}}