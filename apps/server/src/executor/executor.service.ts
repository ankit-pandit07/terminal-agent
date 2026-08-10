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
import { ToolService } from "../tools/tool.service.js";
import { PatchService } from "../editor/patch/patch.service.js";
import { BuildService } from "../verification/build/build.service.js";
import { BackupService } from "../editor/rollback/backup.service.js";
import { RollbackService } from "../editor/rollback/rollback.service.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { MemoryService } from "../memory/memory.service.js"; // Add this import

export class ExecutorService implements Executor {
  private registry = new ToolRegistry();
  private guard = new CommandGuard();

  private session = new SessionState();
  private fileTool = new FileTool(this.session);

  private directoryTool = new DirectoryTool(this.session);
  private editor = new EditorService();
  private patchService = new PatchService();
  private terminalTool = new TerminalTool(this.session);
  private observationService = new ObservationService();

  private toolExecutionRepository = new ToolExecutionRepository();
  private toolService = new ToolService(this.registry);

  private buildService = new BuildService();
  private backupService = new BackupService();
  private rollbackService = new RollbackService();
  private workspaceService = new WorkspaceService();
  private memoryService = new MemoryService();

  constructor() {
    this.registry.register(new EchoTool());
    this.registry.register(this.fileTool);
    this.registry.register(this.directoryTool);
    this.registry.register(this.terminalTool);
    this.registry.register(new SearchTool(this.session));
  }

  private onToolSuccess(tool: string): void {
    this.session.setLastTool(tool);
    this.session.clearLastError();
    this.session.resetRetryCount();
  }

  private onToolFailure(tool: string, error: string): void {
    this.session.setLastTool(tool);
    this.session.setLastError(error);
    this.session.incrementRetryCount();
  }

  private failure(
    tool: string,
    message: string,
    metadata?: ToolMetadata,
  ): ExecutionResult {
    return {
      success: false,
      output: message,
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
        return this.failure(
          "planner",
          "Planner returned an empty execution plan.",
        );
      }

      const outputs: string[] = [];

      for (const step of plan.steps) {
        emitter?.emit("event", {
          type: "tool-start",
          tool: step.tool,
        });
        const tool = this.registry.get(step.tool);

        if (step.tool === "file" && step.input.action === "edit") {
          const path = this.fileTool.resolvePath(String(step.input.path))
          const instruction = String(step.input.instruction);
          let backup: any = null;

          try {
            // Read
            const content = await this.fileTool.readFile(path);

            // Ask AI to edit it
            const updatedContent = await this.editor.edit(content, instruction);

            // Save updated file
            if (
              updatedContent.trim().startsWith("{") ||
              updatedContent.includes("__rules__")
            ) {
              // Save failure to memory
              await this.memoryService.saveToolExecution(
                executionId,
                "file",
                `FAILED: Editor returned JSON instead of source code`,
              );

              return this.failure(
                "file",
                "Editor returned JSON instead of source code.",
              );
            }

            const patchResult = this.patchService.apply(
              content,
              updatedContent,
            );
            if (!patchResult.success) {
              // Save failure to memory
              await this.memoryService.saveToolExecution(
                executionId,
                "file",
                `FAILED: Patch validation failed`,
              );

              return this.failure("file", "Patch validation failed.");
            }

            // Save patch to memory
            await this.memoryService.savePatch(
              executionId,
              path,
              updatedContent,
            );

            // Create backup
            backup = await this.backupService.create(path);

            // Write file
            await this.fileTool.writeFile(path, patchResult.content);

            // Verify build
            const workspace = await this.workspaceService.analyze();
            const build = await this.buildService.verify(workspace);

            if (!build.success) {
              // Build failed - rollback
              await this.rollbackService.restore(backup);
              await this.backupService.delete(backup);

              // Save rollback to memory
              await this.memoryService.saveRollback(executionId, path);

              // Save failure to memory
              await this.memoryService.saveToolExecution(
                executionId,
                "file",
                `FAILED: Build failed after file edit`,
              );

              this.session.addRecovery(
                "Rollback executed after build failure.",
              );
              return this.failure("build", `Build failed.\n${build.stderr}`);
            }

            // Build succeeded - cleanup
            await this.backupService.delete(backup);

            // Save successful execution to memory
            await this.memoryService.saveToolExecution(
              executionId,
              "file",
              `Updated file: ${path} (build verified)`,
            );

            this.session.addRecovery("Patch applied successfully.");
            this.session.addRecovery("Build verification passed.");
            this.onToolSuccess("file");

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

            outputs.push(`Updated file: ${path}`);
            this.session.addModifiedFile(path);
            this.session.addRecovery(`Successfully modified ${path}`);
            continue;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            this.onToolFailure("file", message);

            // Save failure to memory
            await this.memoryService.saveToolExecution(
              executionId,
              "file",
              `FAILED: ${message}`,
            );

            // Restore on failure
            if (backup) {
              try {
                await this.rollbackService.restore(backup);
                await this.backupService.delete(backup);

                // Save rollback to memory
                await this.memoryService.saveRollback(executionId, path);
              } catch (restoreError) {
                console.error(`Failed to restore file ${path}:`, restoreError);
              }
            }

            await this.toolExecutionRepository.create(
              executionId,
              "file",
              JSON.stringify(step.input),
              message,
              false,
            );
            return this.failure(step.tool, message);
          }
        }

        if (!tool) {
          const message = `Tool "${step.tool}" not found`;

          // Save failure to memory
          await this.memoryService.saveToolExecution(
            executionId,
            step.tool,
            `FAILED: ${message}`,
          );

          emitter?.emit("event", {
            type: "tool-complete",
            tool: step.tool,
            success: false,
          });
          return this.failure(step.tool, message);
        }

        if (step.tool === "terminal") {
          const command = String(step.input.command);
          this.session.addExecutedCommand(command);

          if (!this.guard.isSafe(command)) {
            const message = "Blocked: Unsafe command detected.";

            await this.memoryService.saveToolExecution(
              executionId,
              "terminal",
              `FAILED: ${message} ${command}`,
            );

            emitter?.emit("event", {
              type: "tool-complete",
              tool: "terminal",
              success: false,
            });

            await this.toolExecutionRepository.create(
              executionId,
              "terminal",
              JSON.stringify(step.input),
              message,
              false,
            );
            return this.failure("terminal", message);
          }
        }

        const result = await tool.execute(step.input);

        if (result.success) {
          this.onToolSuccess(step.tool);

          // Save successful execution to memory
          await this.memoryService.saveToolExecution(
            executionId,
            step.tool,
            String(result.data),
          );

          // Memory engine - successful command
          if (step.tool === "terminal" && step.input.command) {
            this.session.addSuccessfulCommand(String(step.input.command));
          }
        } else {
          this.onToolFailure(step.tool, String(result.data));

          // Save failure to memory
          await this.memoryService.saveToolExecution(
            executionId,
            step.tool,
            `FAILED: ${String(result.data)}`,
          );

          // Memory engine - failed command
          if (step.tool === "terminal" && step.input.command) {
            this.session.addFailedCommand(String(step.input.command));
          }
        }

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
          const observation = this.observationService.create(
            step.tool,
            false,
            String(result.data),
            result.metadata,
          );

          if (observation.recoverable && observation.suggestion) {
            this.session.addRecovery(observation.suggestion);
          }

          return {
            success: false,
            output: String(result.data),
            observation,
          };
        }

        outputs.push(String(result.data));
      }

      const output = outputs.join("\n");

      // Save final execution summary to memory
      await this.memoryService.saveToolExecution(
        executionId,
        "executor",
        `Completed ${plan.steps.length} steps successfully`,
      );

      return {
        success: true,
        output,
        observation: this.observationService.create("executor", true, output, {
          cwd: this.session.getCurrentDirectory(),
          filesModified: this.session.getModifiedFiles(),
          command: this.session.getExecutedCommands().join(" && "),
        }),
      };
    } catch (error) {
      emitter?.emit("event", {
        type: "tool-complete",
        tool: "executor",
        success: false,
      });

      const message = error instanceof Error ? error.message : "Unknown error";

      // Save error to memory
      await this.memoryService.saveToolExecution(
        executionId,
        "executor",
        `FAILED: ${message}`,
      );

      return this.failure("unknown", message);
    }
  }

  getSession(): SessionState {
    return this.session;
  }

  getToolService(): ToolService {
    return this.toolService;
  }
}
