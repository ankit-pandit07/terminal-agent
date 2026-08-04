import { Role, ExecutionStatus } from "@prisma/client";
import type { AgentResponse } from "./agent.js";
import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import type { ExecutionResult } from "../executor/executor.js";
import type { Plan } from "../planner/planner.js";

import { ExecutorService } from "../executor/executor.service.js";
import { PlanValidator } from "../planner/plan-validator.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";

const executor = new ExecutorService();
const validator = new PlanValidator();
const conversationRepository = new ConversationRepository();
const executionRepository = new ExecutionRepository();
const messageRepository = new MessageRepository();

export async function executePlan(
  plan: Plan,
  emitter?: AgentEventEmitter,
): Promise<ExecutionResult> {
  // Validate plan
  validator.validate(plan);

  // Create a conversation for manual execution
  const conversation = await conversationRepository.create(
    "Manual Plan Execution",
  );

  // Create execution
  const execution = await executionRepository.create(
    conversation.id,
    "Manual Plan Execution",
  );

  // Execute plan
  const result = await executor.execute(execution.id, plan, emitter);

  // Update execution status
  await executionRepository.updateStatus(
    execution.id,
    result.success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
  );

  // Save assistant message
  await messageRepository.create(
    conversation.id,
    Role.ASSISTANT,
    result.output,
  );

  return result;
}

export async function finishExecution(
  executionId: string,
  conversationId: string,
  result: ExecutionResult,
): Promise<AgentResponse> {
  await executionRepository.updateStatus(
    executionId,
    ExecutionStatus.SUCCESS,
  );

  await messageRepository.create(
    conversationId,
    Role.ASSISTANT,
    result.output,
  );

  return {
    success: result.success,
    response: result.output,
    conversationId,
  };
}

export async function failExecution(
  executionId: string,
  conversationId: string,
  message: string,
): Promise<AgentResponse> {
  await executionRepository.updateStatus(
    executionId,
    ExecutionStatus.FAILED,
  );

  return {
    success: false,
    response: message,
    conversationId,
  };
}