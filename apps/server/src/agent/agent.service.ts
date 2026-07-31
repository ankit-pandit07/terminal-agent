import { Role, ExecutionStatus } from "@prisma/client";

import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import { PlanValidator } from "../planner/plan-validator.js";

import type { AgentRequest, AgentResponse } from "./agent.js";

import { ToolExecutionRepository } from "../repositories/tool-execution.repository.js";
import { ContextService } from "../context/context.service.js";

import { ConversationRepository } from "../repositories/conversation.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";

import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import type { Observation } from "../observation/observation.js";

export class AgentService {
  private planner = new PlannerService();
  private executor = new ExecutorService();

  private toolExecutionRepository = new ToolExecutionRepository();
  private validator = new PlanValidator();

  private contextService = new ContextService();
  private conversationRepository = new ConversationRepository();
  private messageRepository = new MessageRepository();
  private executionRepository = new ExecutionRepository();
  private workspaceService = new WorkspaceService();
  private readonly MAX_ITERATIONS = 5;

  async process(
    request: AgentRequest,
    emitter?: AgentEventEmitter,
  ): Promise<AgentResponse> {
    let execution: { id: string } | null = null;

    try {
      // Create Conversation
      let conversation;

      if (request.conversationId) {
        conversation = await this.conversationRepository.findById(
          request.conversationId,
        );

        if (!conversation) {
          throw new Error("Conversation not found");
        }
      } else {
        conversation = await this.conversationRepository.create(
          request.message,
        );
      }

      // Save User Message
      await this.messageRepository.create(
        conversation.id,
        Role.USER,
        request.message,
      );

      // Create Execution
      execution = await this.executionRepository.create(
        conversation.id,
        request.message,
      );

      // Build Context
      const context = await this.contextService.buildContext(conversation.id);

      const workspace = await this.workspaceService.analyze();

      let executionHistory = "";
      for (let i = 0; i < this.MAX_ITERATIONS; i++) {
        this.emit(emitter, {
          type: "planning",
          message: `Planning iteration ${i + 1}...`,
        });
       const plan = await this.planner.createPlan(
 request.message,
    context,
    workspace,
    executionHistory,
)
       this.emit(emitter,{
    type:"plan-created",
    steps:plan.steps.length,
});
        const result = await this.executor.execute(execution.id, plan, emitter);

        if (result.completed) {
          this.emit(emitter, {
            type: "completed",
            response: result.output,
          });
          await this.executionRepository.updateStatus(
            execution.id,
            ExecutionStatus.SUCCESS,
          );

          await this.messageRepository.create(
            conversation.id,
            Role.ASSISTANT,
            result.output,
          );

          return {
            success: result.success,
            response: result.output,
            conversationId: conversation.id,
          };
        }

        const step = plan.steps[0];

        if (!step) {
          await this.executionRepository.updateStatus(
            execution.id,
            ExecutionStatus.FAILED,
          );

          return {
            success: false,
            response: "Planner returned an empty plan.",
            conversationId: conversation.id,
          };
        }
        executionHistory = this.appendObservation(
    executionHistory,
    result.observation,
);
      }

      await this.executionRepository.updateStatus(
        execution.id,
        ExecutionStatus.FAILED,
      );

      return {
        success: false,
        response: "Maximum reasoning iterations reached.",
        conversationId: conversation.id,
      };
    } catch (error) {
      this.emit(emitter, {
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      if (execution) {
        await this.executionRepository.updateStatus(
          execution.id,
          ExecutionStatus.FAILED,
        );
      }

      throw error;
    }
  }
  async deleteConversation(conversationId: string) {
    // find conversation
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }
    // delete toolExecutions
    for (const execution of conversation.executions) {
      await this.toolExecutionRepository.deleteByExecution(execution.id);
    }
    // delete executions
    await this.executionRepository.deleteByConversation(conversationId);

    //delete messages
    await this.messageRepository.deleteByConversation(conversationId);

    // delete conversation
    await this.conversationRepository.delete(conversationId);

    return {
      success: true,
      message: "Conversation deleted successfully",
    };
  }
  async getConversation(conversationId: string) {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation;
  }

  async getExecutions(conversationId: string) {
    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    return this.executionRepository.findByConversation(conversationId);
  }
  async getHistory() {
    return this.conversationRepository.findAll();
  }
  private emit(
    emitter: AgentEventEmitter | undefined,
    event: Parameters<AgentEventEmitter["emit"]>[1],
  ) {
    emitter?.emit("event", event);
  }

  private appendObservation(
  history: string,
  observation: Observation,
): string {
  return (
    history +
    `
Tool:
${observation.tool}

Category:
${observation.category}

Summary:
${observation.summary}

Facts:
${observation.facts.join("\n")}

Errors:
${observation.errors.join("\n")}

-----------------------------------
`
  );
}
}