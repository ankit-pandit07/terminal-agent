import type { AgentRequest, AgentResponse } from "./agent.js";
import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import type { Plan } from "../planner/planner.js";
import type { ExecutionResult } from "../executor/executor.js";
import type { ToolCategory } from "../tools/base/tool.interface.js";
import { processAgentRequest } from "./process.js";
import {
  deleteConversation,
  getConversation,
  getExecutions,
  getHistory,
  getExecution,
} from "./conversation.js";
import { getWorkspace } from "./workspace.js";
import { createPlan } from "./planning.js";
import { executePlan } from "./execution.js";
import {
  disableTool,
  enableTool,
  getTool,
  getTools,
  getToolsByCategory,
} from "./tools.js";
import { getSession } from "./session.js";
import { MemoryService } from "../memory/memory.service.js";
import { confirmationService } from "../executor/confirmation.instance.js";
import { executor } from "../executor/executor.instance.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ExecutionStatus, Role } from "@prisma/client";

const executionRepository = new ExecutionRepository();
const messageRepository = new MessageRepository();

export class AgentService {
  // Public API - Sirf delegate karega
  private memoryService = new MemoryService();

  async process(
    request: AgentRequest,
    emitter?: AgentEventEmitter,
  ): Promise<AgentResponse> {
    return processAgentRequest(request, emitter);
  }

  async deleteConversation(conversationId: string, userId?: string) {
    return deleteConversation(conversationId, userId);
  }

  async getConversation(conversationId: string, userId?: string) {
    return getConversation(conversationId, userId);
  }

  async getExecutions(conversationId: string, userId?: string) {
    return getExecutions(conversationId, userId);
  }

  async getExecution(executionId: string, userId?: string) {
    return getExecution(executionId, userId);
  }

  async getHistory(userId?: string) {
    return getHistory(userId);
  }

  async getSession() {
    return getSession();
  }

  async getWorkspace() {
    return getWorkspace();
  }

  async createPlan(message: string): Promise<Plan> {
    return createPlan(message);
  }

  async executePlan(
    plan: Plan,
    emitter?: AgentEventEmitter,
    userId?: string,
  ): Promise<ExecutionResult> {
    return executePlan(plan, emitter, userId);
  }

  getTools() {
    return getTools();
  }

  getTool(name: string) {
    return getTool(name);
  }

  enableTool(name: string) {
    return enableTool(name);
  }

  disableTool(name: string) {
    return disableTool(name);
  }

  getToolsByCategory(category: ToolCategory) {
    return getToolsByCategory(category);
  }

  async getMemoryHistory(userId?: string) {
    return this.memoryService.history(userId);
  }

  async getConversationMemory(conversationId: string, userId?: string) {
    return this.memoryService.getByConversation(conversationId, userId);
  }

  async confirmExecution(
    confirmationId: string,
    emitter?: AgentEventEmitter,
    userId?: string,
  ): Promise<{
    success: boolean;
    response: string;
  }> {
    const confirmation = confirmationService.confirm(confirmationId, userId);

    if (!confirmation) {
      return {
        success: false,
        response: "Confirmation not found or it has already been handled.",
      };
    }

    try {
      const result = await executor.execute(
        confirmation.executionId,
        confirmation.plan,
        emitter,
      );

      await executionRepository.updateStatus(
        confirmation.executionId,
        result.success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
      );

      await messageRepository.create(
        confirmation.conversationId,
        Role.ASSISTANT,
        result.output,
      );

      return {
        success: result.success,
        response: result.output,
      };
    } catch (error) {
      await executionRepository.updateStatus(
        confirmation.executionId,
        ExecutionStatus.FAILED,
      );

      const message =
        error instanceof Error ? error.message : "Execution failed.";

      return {
        success: false,
        response: message,
      };
    }
  }

  cancelConfirmation(
    confirmationId: string,
    userId?: string
  ): {
    success: boolean;
    response: string;
  } {
    const cancelled = confirmationService.cancel(confirmationId, userId);

    if (!cancelled) {
      return {
        success: false,
        response:
          "Confirmation not found or it has already been handled.",
      };
    }

    return {
      success: true,
      response: "Confirmation cancelled. No action was executed.",
    };
  }
}
