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
import { ToolExecutionRepository } from "../repositories/tool-execution.repository.js";
import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import { ObservationService } from "../observation/observation.service.js";
import type { ToolMetadata } from "../tools/base/tool.interface.js";

export class ExecutorService implements Executor {
  private registry = new ToolRegistry();
  private guard = new CommandGuard();

  private session = new SessionState();
  private fileTool = new FileTool(this.session);

  private directoryTool = new DirectoryTool(this.session);
  private editor = new EditorService();
  private terminalTool = new TerminalTool(this.session);
private observationService = new ObservationService();

  private toolExecutionRepository = new ToolExecutionRepository();

  constructor() {
    this.registry.register(new EchoTool());
    this.registry.register(this.fileTool);
    this.registry.register(this.directoryTool);
    this.registry.register(this.terminalTool);
    this.registry.register(new SearchTool(this.session));
  }

  private failure(tool:string,message: string,metadata?: ToolMetadata): ExecutionResult {
    return {
      success: false,
      output: message,
      completed: false,
      observation: this.observationService.create(
     tool,
    false,
    message,
    metadata,
    ),
    };
  }

  async execute(
    executionId: string,
    plan: Plan,
        emitter?: AgentEventEmitter,
  ): Promise<ExecutionResult> {
    try {
      if (plan.steps.length === 0) {
        return this.failure("planner","Planner returned an empty execution plan.");
      }

      let outputs: string[] = [];

      for (const step of plan.steps) {
        emitter?.emit("event", {
          type: "tool-start",
          tool: step.tool,
        });
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
              return this.failure(
                "file",
                "Editor returned JSON instead of source code.",
              );
            }

            await this.fileTool.writeFile(path, updatedContent);
            emitter?.emit("event", {
              type: "tool-complete",
              tool: "file",
              success: true,
            });
            await this.toolExecutionRepository.create(
              executionId,
              "file",
              JSON.stringify(step.input),
              `Updated file: ${path}`,
              true,
            );
            outputs.push(`Updated file:${path}`);

            continue;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            await this.toolExecutionRepository.create(
              executionId,
              "file",
              JSON.stringify(step.input),
              message,
              false,
            );
            return this.failure(step.tool,message);
          }
        }
        
        if (!tool) {
          const message = `Tool "${step.tool}" not found`;
          emitter?.emit("event", {
          type: "tool-complete",
          tool: step.tool,
          success: false,
        });
          return this.failure(step.tool,message);
        }

        if (step.tool === "terminal") {
          const command = String(step.input.command);
          emitter?.emit("event", {
            type: "tool-complete",
            tool: "terminal",
            success: false,
          });
          if (!this.guard.isSafe(command)) {
            return this.failure(
              "terminal",
              "Blocked: Unsafe command detected.");
          }
        }

        const result = await tool.execute(step.input);
        emitter?.emit("event", {
          type: "tool-complete",
          tool: step.tool,
          success: result.success,
        });
        await this.toolExecutionRepository.create(
          executionId,
          step.tool,
          JSON.stringify(step.input),
          String(result.data),
          result.success,
        );

        if (!result.success) {
          return this.failure(
            step.tool,
            String(result.data),
            result.metadata
          );
        }

        outputs.push(String(result.data));
      }
const output=outputs.join("\n")
      return {
        success: true,
        output: outputs.join("\n"),
        completed: true,

        observation:this.observationService.create(
        "executor",
        true,
        output
    )
      };
    } catch (error) {
      emitter?.emit("event", {
        type: "tool-complete",
        tool: "file",
        success: false,
      });
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.failure("unknown",message);
    }
  }
}
