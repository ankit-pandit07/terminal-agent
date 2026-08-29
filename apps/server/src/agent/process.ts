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
import { RecoveryService } from "../recovery/recovery.service.js";
import { hydrateAttachedFiles } from "../files/file-context.builder.js";
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

const recoveryService = new RecoveryService();

const MAX_ITERATIONS = 5;

export async function processAgentRequest(
  request: AgentRequest,
  emitter?: AgentEventEmitter,
): Promise<AgentResponse> {
  let execution: { id: string } | null = null;
  let recoveryAttempted = false;
  const sessionState = executor.getSession();
  try {
    // Create Conversation
    let conversation;

    if (request.conversationId) {
      conversation = await conversationRepository.findById(
        request.conversationId,
        request.userId
      );

      if (!conversation) {
        throw new Error("Conversation not found or unauthorized");
      }
    } else {
      conversation = await conversationRepository.create(request.message, request.userId);
    }

    // Save User Message
    await messageRepository.create(conversation.id, Role.USER, request.message);

    // STEP 1: Save conversation to memory
    await memoryService.saveConversation(
      conversation.id,
      "user-message",
      request.message,
      request.userId
    );

    // Hydrate attached files if provided in the current request
    let attachedFilesContext = "";
    if (request.fileIds && request.fileIds.length > 0 && request.authToken) {
      const hydrated = await hydrateAttachedFiles(
        request.fileIds,
        request.authToken,
      );
      attachedFilesContext = hydrated.context;

      for (const fileMeta of hydrated.files) {
        try {
          await memoryService.saveConversation(
            conversation.id,
            "file-attachment",
            JSON.stringify({
              id: fileMeta.id,
              originalName: fileMeta.originalName,
              mimeType: fileMeta.mimeType,
              size: fileMeta.size,
              storageKey: fileMeta.storageKey,
            }),
            request.userId,
          );

          if (fileMeta.extractedText) {
            await memoryService.saveConversation(
              conversation.id,
              "file-content",
              JSON.stringify({
                fileId: fileMeta.id,
                originalName: fileMeta.originalName,
                text: fileMeta.extractedText,
              }),
              request.userId,
            );
          }
        } catch (memErr) {
          console.warn("Could not save file to memory:", memErr);
        }
      }
    }

    // Create Execution
    execution = await executionRepository.create(
      conversation.id,
      request.message,
      request.userId
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
        attachedFilesContext,
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
          request.userId
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
          request.userId
        );

        return finishExecution(execution.id, conversation.id, result);
      }

      lastReflection = observationService.createReflection(result.observation);

      emit(emitter, {
        type: "reflection",
        reflection: lastReflection,
      });

      const verification = recoveryAttempted
  ? verifier.verifyGoal(request.message, result.observation)
  : verifier.verify(plan, result.observation);
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
        const recovery = recoveryService.decide(result.observation);

        emit(emitter, {
          type: "recovery",
          action: recovery.action,
          reason: recovery.reason,
          confidence: recovery.confidence,
        });

        const recoveryKey = [
          result.observation.tool,
          result.observation.summary,
          recovery.action,
        ].join(":");

        if (sessionState.getRecoveryHistory().includes(recoveryKey)) {
          executionHistory = appendObservation(
            executionHistory,
            result.observation,
          );

          return failExecution(
            execution.id,
            conversation.id,
            "The same recovery strategy has already been attempted. Stopping to avoid an execution loop.",
          );
        }

        sessionState.addRecovery(recoveryKey);

        if (recovery.action === "stop") {
          return failExecution(execution.id, conversation.id, recovery.reason);
        }

        recoveryAttempted = true;

        executionHistory = appendObservation(
          executionHistory,
          result.observation,
        );

        executionHistory += `
Recovery Decision:
Action: ${recovery.action}
Reason: ${recovery.reason}
Confidence: ${recovery.confidence}

Recovery Instruction:
Do not repeat the failed operation unchanged.
Generate the next plan according to the recovery action.
`;

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
          request.userId
        );

        return finishExecution(execution.id, conversation.id, result);
      }

      if (plan.steps.length === 0) {
        // STEP 5: Save failure to memory
        await memoryService.saveExecution(
          execution.id,
          "error",
          "Planner returned an empty plan.",
          request.userId
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
    await memoryService.saveExecution(execution.id, "error", errorMessage, request.userId);

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
      await memoryService.saveExecution(execution.id, "error", errorMessage, request.userId);
    }

    throw error;
  }
}
