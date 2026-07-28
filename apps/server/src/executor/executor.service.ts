import { ToolRegistry } from "../tools/base/tool.registry.js";
import { EchoTool } from "../tools/echo/echo.tool.js";
import { TerminalTool } from "../tools/terminal/terminal.tool.js";
import type { ExecutionResult, Executor } from "./executor.js";
import type { Plan } from "../planner/planner.js";
import { CommandGuard } from "../security/command-guard.js";
import { FileTool } from "../tools/file/file.tool.js";

export class ExecutorService implements Executor {
  private registry = new ToolRegistry();
  private guard = new CommandGuard();

  constructor() {
    this.registry.register(new EchoTool());
    this.registry.register(new TerminalTool());
    this.registry.register(new FileTool());
  }

  async execute(plan: Plan): Promise<ExecutionResult> {
    const tool = this.registry.get(plan.tool);

    if (plan.tool === "terminal") {
      const command = String(plan.input.command);

      if (!this.guard.isSafe(command)) {
        return {
          success: false,
          output: "Blocked:Unsafe command detected.",
        };
      }
    }

    if (!tool) {
      return {
        success: false,
        output: `Tool "${plan.tool}" not found`,
      };
    }

    const result = await tool.execute(plan.input);

    return {
      success: result.success,
      output: String(result.data),
    };
  }
}
