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
import { ConversationContextService } from "../context/conversation-context.service.js";


// Services - Initialized once and shared

const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository();
const executionRepository = new ExecutionRepository();
const contextService = new ContextService();
const workspaceService = new WorkspaceService();
const planner = new PlannerService();

const verifier = new VerificationService();
const observationService = new ObservationService();
const goalService=new GoalService();
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
      conversation = await conversationRepository.create(
        request.message,
      );
    }

    // Save User Message
 await messageRepository.create(
  conversation.id,
  Role.USER,
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

      const plan = await planner.createPlan(
        request.message,
        plannerHistory,
        workspace,
        sessionContext,
        lastObservation,
        lastReflection,
      );
      
      emit(emitter, {
        type: "plan-created",
        steps: plan.steps.length,
      });
      
      const result = await executor.execute(execution.id, plan, emitter);
      lastObservation = result.observation;

      const goal= await goalService.evaluate(
        request.message,
        result.output,
        result.observation
      )
      emit(emitter,{
        type:"goal",
        goal
      })

      if(goal.completed){
        emit(emitter,{
          type:"completed",
          response:result.output
        });
        return finishExecution(
          execution.id,
          conversation.id,
          result
        )
      }
      lastReflection = observationService.createReflection(
        result.observation,
      );
      
      emit(emitter, {
        type: "reflection",
        reflection: lastReflection,
      });
      
      const verification = verifier.verify(plan, result.observation);
      const retry = shouldRetry(verification, result.observation, i, MAX_ITERATIONS);

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
        });

        return finishExecution(execution.id, conversation.id, result);
      }

      if (plan.steps.length === 0) {
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

    // if we've exhausted all iterations without success
    return failExecution(
      execution.id,
      conversation.id,
      `Maximum iterations (${MAX_ITERATIONS}) reached without completing the task.`,
    );
  } catch (error) {
    emit(emitter, {
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    if (execution) {
      await executionRepository.updateStatus(
        execution.id,
        ExecutionStatus.FAILED,
      );
    }

    throw error;
  }
}