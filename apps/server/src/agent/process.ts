import { Role, ExecutionStatus } from "@prisma/client";
import type { AgentRequest, AgentResponse } from "./agent.js";
import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import type { Observation, Reflection } from "../observation/observation.js";

import { ConversationRepository } from "../repositories/conversation.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ContextService } from "../context/context.service.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { PlannerService } from "../planner/planner.service.js";
import { executor } from "../executor/executor.instance.js";
import { VerificationService } from "../verification/verification.service.js";
import { ObservationService } from "../observation/observation.service.js";
import { appendObservation, emit, shouldRetry } from "./helper.js";
import { failExecution, finishExecution } from "./execution.js";
import { buildSessionContext } from "./session.js";
import { GoalService } from "../goal/goal.service.js";
import { ContextRetriever } from "../context/retriever/context.retriever.js";
import { PlannerRouter } from "../planner/router/router.js";
import { MemoryService } from "../memory/memory.service.js"; // Add this import
import { buildMemoryContext } from "../memory/memory-context.js";
import { SafetyService } from "../executor/safety.service.js";
import { confirmationService } from "../executor/confirmation.instance.js";
// Services - Initialized once and shared

const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository();
const executionRepository = new ExecutionRepository();
const contextService = new ContextService();
const workspaceService = new WorkspaceService();
const contextRetriever = new ContextRetriever();
const planner = new PlannerService();
const router = new PlannerRouter();

const verifier = new VerificationService();
const observationService = new ObservationService();
const goalService = new GoalService();
const memoryService = new MemoryService();
const safetyService = new SafetyService();
const MAX_ITERATIONS = 5;

export async function processAgentRequest(
  request: AgentRequest,
  emitter?: AgentEventEmitter,
): Promise<AgentResponse> {
  let execution: { id: string } | null = null;

  try {
    // Create Conversation
    let conversation;

    if (request.conversationId) {
      conversation = await conversationRepository.findById(
        request.conversationId,
      );

      if (!conversation) {
        throw new Error("Conversation not found");
      }
    } else {
      conversation = await conversationRepository.create(request.message);
    }

    // Save User Message
    await messageRepository.create(conversation.id, Role.USER, request.message);

    // STEP 1: Save conversation to memory
    await memoryService.saveConversation(
      conversation.id,
      "user-message",
      request.message,
    );

    // Create Execution
    execution = await executionRepository.create(
      conversation.id,
      request.message,
    );

    // Build Context
    const workspace = await workspaceService.analyze();

    let executionHistory = "";
    let lastObservation: Observation | undefined;
    let lastReflection: Reflection | undefined;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const context = await contextService.buildContext(conversation.id);
      const sessionContext = buildSessionContext();
      const plannerHistory = `
Conversation Context:

${context}

Execution History:

${executionHistory}
`;
      emit(emitter, {
        type: "planning",
        message: `Planning iteration ${i + 1}...`,
      });

      const retrievedContext = await contextRetriever.retrieve(request.message);
      const route = router.route(request.message);

      emit(emitter, {
        type: "decision",
        decision: route.decision,
      });

      const memoryContext = await buildMemoryContext(request.message);
      const plan = await planner.createPlan(
        request.message,
        plannerHistory,
        memoryContext,
        workspace,
        retrievedContext,
        sessionContext,
        lastObservation,
        lastReflection,
      );

      emit(emitter, {
        type: "plan-created",
        steps: plan.steps.length,
      });

      //Safety check
      const safetyResults = safetyService.checkPlan(plan);
      const dangeoursStep = safetyResults.find(
        (result) => result.requiresConfirmation,
      );

      if (dangeoursStep) {
        const message = `Confirmation required: ${dangeoursStep.reason}`;

        const pending = confirmationService.create(
          execution.id,
          conversation.id,
          plan,
          message,
        );

        emit(emitter, {
          type: "confirmation-required",
          confirmationId: pending.id,
          message: pending.message,
        });

        return {
          success: false,
          response: message,
          conversationId: conversation.id,
          requiresConfirmation: true,
          confirmationId: pending.id,
        };
      }

      const result = await executor.execute(execution.id, plan, emitter);
      lastObservation = result.observation;

      // FIX: Handle rule-based execution early
      if (plan.source === "ai") {
        emit(emitter, {
          type: "completed",
          response: result.output,
          conversationId: conversation.id,
        });

        // STEP 2: Save execution result to memory for AI plan
        await memoryService.saveExecution(
          execution.id,
          "final-output",
          result.output,
        );

        return finishExecution(execution.id, conversation.id, result);
      }

      let goal;

      if (plan.source === "rule") {
        goal = {
          completed: result.success,
          confidence: result.success ? 1 : 0,
          reason: result.success
            ? "Rule executed successfully."
            : "Rule execution failed.",
        };
      } else {
        goal = await goalService.evaluate(
          request.message,
          result.output,
          result.observation,
        );
      }

      emit(emitter, {
        type: "goal",
        goal,
      });

      if (goal.completed) {
        emit(emitter, {
          type: "completed",
          response: result.output,
          conversationId: conversation.id,
        });

        // STEP 3: Save execution result to memory when goal is completed
        await memoryService.saveExecution(
          execution.id,
          "final-output",
          result.output,
        );

        return finishExecution(execution.id, conversation.id, result);
      }

      lastReflection = observationService.createReflection(result.observation);

      emit(emitter, {
        type: "reflection",
        reflection: lastReflection,
      });

      const verification = verifier.verify(plan, result.observation);
      const retry = shouldRetry(
        verification,
        result.observation,
        i,
        MAX_ITERATIONS,
      );

      emit(emitter, {
        type: "verification",
        verification,
        retry,
      });

      if (retry) {
        executionHistory = appendObservation(
          executionHistory,
          result.observation,
        );
        continue;
      }

      if (verification.status === "completed") {
        emit(emitter, {
          type: "completed",
          response: result.output,
          conversationId: conversation.id,
        });

        // STEP 4: Save execution result to memory when verification passes
        await memoryService.saveExecution(
          execution.id,
          "final-output",
          result.output,
        );

        return finishExecution(execution.id, conversation.id, result);
      }

      if (plan.steps.length === 0) {
        // STEP 5: Save failure to memory
        await memoryService.saveExecution(
          execution.id,
          "error",
          "Planner returned an empty plan.",
        );

        return failExecution(
          execution.id,
          conversation.id,
          "Planner returned an empty plan.",
        );
      }

      executionHistory = appendObservation(
        executionHistory,
        result.observation,
      );
    }

    // If we've exhausted all iterations without success
    const errorMessage = `Maximum iterations (${MAX_ITERATIONS}) reached without completing the task.`;

    // STEP 6: Save max iterations reached to memory
    await memoryService.saveExecution(execution.id, "error", errorMessage);

    return failExecution(execution.id, conversation.id, errorMessage);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    emit(emitter, {
      type: "error",
      message: errorMessage,
    });

    if (execution) {
      await executionRepository.updateStatus(
        execution.id,
        ExecutionStatus.FAILED,
      );

      // STEP 7: Save error to memory
      await memoryService.saveExecution(execution.id, "error", errorMessage);
    }

    throw error;
  }
}
