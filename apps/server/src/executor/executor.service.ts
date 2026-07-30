import { ToolRegistry } from "../tools/base/tool.registry.js";
import { EchoTool } from "../tools/echo/echo.tool.js";
import { TerminalTool } from "../tools/terminal/terminal.tool.js";
import type { ExecutionResult, Executor } from "./executor.js";
import type { Plan } from "../planner/planner.js";
import { CommandGuard } from "../security/command-guard.js";
import { FileTool } from "../tools/file/file.tool.js";
import { DirectoryTool } from "../tools/directory/directory.tool.js";
import { EditorService } from "../editor/editor.service.js";
import { SessionState } from "../session/session.state.js";
import { SearchTool } from "../tools/search/search.tool.js";

export class ExecutorService implements Executor {
  private registry = new ToolRegistry();
  private guard = new CommandGuard();

  private session = new SessionState();
  private fileTool = new FileTool(this.session);

  private directoryTool = new DirectoryTool(this.session);
  private editor = new EditorService();
  private terminalTool=new TerminalTool(this.session)
 

  constructor() {
    this.registry.register(new EchoTool());
    this.registry.register(this.fileTool);
    this.registry.register(this.directoryTool);
    this.registry.register(this.terminalTool);
    this.registry.register(new SearchTool(this.session));
  
  }

  private failure(message: string): ExecutionResult {
  return {
    success: false,
    output: message,
    observation: message,
    completed: false,
  };
}

  async execute(plan: Plan): Promise<ExecutionResult> {
    try{
      if (plan.steps.length === 0) {
  return this.failure("Planner returned an empty execution plan.");
}

      let outputs: string[] = [];

    for (const step of plan.steps) {
      const tool = this.registry.get(step.tool);

      if (step.tool === "file" && step.input.action === "edit") {
        const path = String(step.input.path);
        const instruction = String(step.input.instruction);

        try {
          //Read
          const content = await this.fileTool.readFile(path);

          // Ask AI to edit it
          const updatedContent = await this.editor.edit(content, instruction);

          //Save updated file
          if (
            updatedContent.trim().startsWith("{") ||
            updatedContent.includes("__rules__")
          ) {
           return this.failure("Editor returned JSON instead of source code.");
          }

          await this.fileTool.writeFile(path, updatedContent);

          outputs.push(`Updated file:${path}`);

          continue;
        } catch (error) {
  const message =
    error instanceof Error ? error.message : "Unknown error";

return this.failure(message);
}
      }
      if (!tool) {
        const message = `Tool "${step.tool}" not found`;
        return this.failure(message);
      }

      if (step.tool === "terminal") {
        const command = String(step.input.command);

        if (!this.guard.isSafe(command)) {
          return this.failure("Blocked: Unsafe command detected.");
        }
      }

      const result = await tool.execute(step.input);

    if (!result.success) {
  const message = String(result.data);

  return this.failure(message);
}

      outputs.push(String(result.data));
    }

   return {
  success: true,
  output: outputs.join("\n"),
  completed: true,
};
  }catch(error){
    const message=error instanceof Error ? error.message : "Unknown error";
    return this.failure(message);
  }
}
}
