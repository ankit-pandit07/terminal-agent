import { ToolRegistry } from "../tools/base/tool.registry.js";
import { EchoTool } from "../tools/echo/echo.tool.js";
import { TerminalTool } from "../tools/terminal/terminal.tool.js";
import type { ExecutionResult, Executor } from "./executor.js";
import type { Plan } from "../planner/planner.js";
import { CommandGuard } from "../security/command-guard.js";
import { FileTool } from "../tools/file/file.tool.js";
import { DirectoryTool } from "../tools/directory/directory.tool.js";
import { EditorService } from "../editor/editor.service.js";

export class ExecutorService implements Executor {
  private registry = new ToolRegistry();
  private guard = new CommandGuard();
  private fileTool = new FileTool();
  private directoryTool = new DirectoryTool();
  private editor = new EditorService();

  constructor() {
    this.registry.register(new EchoTool());
    this.registry.register(new TerminalTool());
    this.registry.register(this.fileTool);
    this.registry.register(this.directoryTool);
  }
  async execute(plan: Plan): Promise<ExecutionResult> {
    let outputs: string[] = [];

    for (const step of plan.steps) {
      const tool = this.registry.get(step.tool);

      if(step.tool==="file" && step.input.action==="edit"){
        const path=String(step.input.path);
        const instruction=String(step.input.instruction);

        try{
          //Read
        const content=await this.fileTool.readFile(path);

        // Ask AI to edit it
        const updatedContent=await this.editor.edit(
          content,
          instruction,
        );

        //Save updated file
        if (
  updatedContent.trim().startsWith("{") ||
  updatedContent.includes("__rules__")
) {
  return {
    success: false,
    output: "Editor returned JSON instead of source code."
  };
}

await this.fileTool.writeFile(path, updatedContent);

        outputs.push(`Updated file:${path}`);

        continue;
        
      }catch(error){
        return {
          success:false,
          output: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
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
  }
}
