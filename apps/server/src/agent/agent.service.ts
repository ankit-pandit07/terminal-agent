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

  async deleteConversation(conversationId: string) {
    return deleteConversation(conversationId);
  }

  async getConversation(conversationId: string) {
    return getConversation(conversationId);
  }

  async getExecutions(conversationId: string) {
    return getExecutions(conversationId);
  }

  async getExecution(executionId: string) {
    return getExecution(executionId);
  }

  async getHistory() {
    return getHistory();
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
  ): Promise<ExecutionResult> {
    return executePlan(plan, emitter);
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

  async getMemoryHistory() {
    return this.memoryService.history();
  }

  async getConversationMemory(conversationId: string) {
    return this.memoryService.getByConversation(conversationId);
  }

  async confirmExecution(
    confirmationId: string,
    emitter?: AgentEventEmitter,
  ): Promise<{
    success: boolean;
    response: string;
  }> {
    const confirmation = confirmationService.confirm(confirmationId);

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

  cancelConfirmation(confirmationId: string): {
  success: boolean;
  response: string;
} {
  const cancelled = confirmationService.cancel(confirmationId);

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
