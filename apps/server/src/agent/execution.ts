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
import { SafetyService } from "../executor/safety.service.js";
import { confirmationService } from "../executor/confirmation.instance.js";
import { ObservationService } from "../observation/observation.js";

const executor = new ExecutorService();
const validator = new PlanValidator();
const conversationRepository = new ConversationRepository();
const executionRepository = new ExecutionRepository();
const messageRepository = new MessageRepository();
const safetyService = new SafetyService();
const observationService = new ObservationService();

export async function executePlan(
  plan: Plan,
  emitter?: AgentEventEmitter,
): Promise<ExecutionResult> {
  // Validate plan
  validator.validate(plan);

  // Safety check
  const safetyResults = safetyService.checkPlan(plan);
  const dangerousStep = safetyResults.find(
    (result) => result.requiresConfirmation,
  );

  // Dangerous operation requires confirmation
  if (dangerousStep) {
    const conversation = await conversationRepository.create(
      "Manual Plan Execution",
    );

    const execution = await executionRepository.create(
      conversation.id,
      "Manual Plan Execution",
    );

    const message = `Confirmation required: ${dangerousStep.reason}`;

    const pending = confirmationService.create(
      execution.id,
      conversation.id,
      plan,
      message,
    );

    const observation = observationService.create(
      dangerousStep.step?.tool ?? "safety",
      false,
      message,
    );

    return {
      success: false,
      output: message,
      observation,
      requiresConfirmation: true,
      confirmationId: pending.id,
    };
  }

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
  await executionRepository.updateStatus(executionId, ExecutionStatus.SUCCESS);

  await messageRepository.create(conversationId, Role.ASSISTANT, result.output);

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
  await executionRepository.updateStatus(executionId, ExecutionStatus.FAILED);

  return {
    success: false,
    response: message,
    conversationId,
  };
}
