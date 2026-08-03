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

import { VerificationService } from "../verification/verification.service.js";
import type { ExecutionResult } from "../executor/executor.js";
import type { Plan } from "../planner/planner.js";
import type { VerificationResult } from "../verification/verification.types.js";
import type { Observation, Reflection } from "../observation/observation.js";
import { ObservationService } from "../observation/observation.service.js";

export class AgentService {
  private planner = new PlannerService();
  private executor = new ExecutorService();

  private toolExecutionRepository = new ToolExecutionRepository();
  private validator = new PlanValidator();
  private verifier = new VerificationService();

  private contextService = new ContextService();
  private conversationRepository = new ConversationRepository();
  private messageRepository = new MessageRepository();
  private executionRepository = new ExecutionRepository();
  private workspaceService = new WorkspaceService();
  private readonly MAX_ITERATIONS = 5;
  private observationService = new ObservationService();

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
      let lastObservation: Observation | undefined;
      let lastReflection: Reflection | undefined;
      for (let i = 0; i < this.MAX_ITERATIONS; i++) {
        const sessionContext = this.buildSessionContext();
        const plannerHistory = `
Conversation Context:

${context}

Execution History:

${executionHistory}
`;
        this.emit(emitter, {
          type: "planning",
          message: `Planning iteration ${i + 1}...`,
        });

        const plan = await this.planner.createPlan(
          request.message,
          plannerHistory,
          workspace,
          sessionContext,
          lastObservation,
          lastReflection
        );
        this.emit(emitter, {
          type: "plan-created",
          steps: plan.steps.length,
        });
        const result = await this.executor.execute(execution.id, plan, emitter);
        lastObservation = result.observation;

        lastReflection=this.observationService.createReflection(
          result.observation
        )
        this.emit(emitter, {
  type: "reflection",
  reflection: lastReflection,
});
        const verification = this.verify(plan, result.observation);
        const retry = this.shouldRetry(verification, result.observation, i);

        this.emit(emitter, {
          type: "verification",
          verification,
          retry,
        });
        if (retry) {
          executionHistory = this.appendObservation(
            executionHistory,
            result.observation,
          );

          continue;
        }
        if (verification.status === "completed") {
          this.emit(emitter, {
            type: "completed",
            response: result.output,
          });

          return this.finishExecution(execution.id, conversation.id, result);
        }

        if (plan.steps.length === 0) {
          return this.failExecution(
            execution.id,
            conversation.id,
            "Planner returned an empty plan.",
          );
        }

        executionHistory = this.appendObservation(
          executionHistory,
          result.observation,
        );
      }

      // mif we've exhausated all iteratinos without success
      return this.failExecution(
        execution.id,
        conversation.id,
        `Maximum iterations (${this.MAX_ITERATIONS}) reached without completing the task.`,
      );
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

async getSession() {
  return this.executor.getSession().getSnapshot();
}
  async getWorkspace(){
    return this.workspaceService.analyze();
  }
  async createPlan(message:string):Promise<Plan>{
    const workspace=await this.workspaceService.analyze();

    const history="";

    const sessionContext=this.buildSessionContext();

    const plan=await this.planner.createPlan(
      message,
      history,
      workspace,
      sessionContext
    );

    this.validator.validate(plan)
     return plan
  }

  private appendObservation(history: string, observation: Observation): string {
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
private buildSessionContext(): string {
  const session = this.executor.getSession();

  return `
==============================
Execution Memory
==============================

Current Directory:
${session.getCurrentDirectory()}

Last Tool:
${session.getLastTool() ?? "None"}

Last Error:
${session.getLastError() ?? "None"}

Retry Count:
${session.getRetryCount()}

--------------------------------

Executed Commands:
${
  session.getExecutedCommands().length
    ? session.getExecutedCommands().map(cmd => `- ${cmd}`).join("\n")
    : "None"
}

--------------------------------

Successful Commands:
${
  session.getSuccessfulCommands().length
    ? session.getSuccessfulCommands().map(cmd => `- ${cmd}`).join("\n")
    : "None"
}

--------------------------------

Failed Commands:
${
  session.getFailedCommands().length
    ? session.getFailedCommands().map(cmd => `- ${cmd}`).join("\n")
    : "None"
}

--------------------------------

Modified Files:
${
  session.getModifiedFiles().length
    ? session.getModifiedFiles().map(file => `- ${file}`).join("\n")
    : "None"
}

--------------------------------

Visited Directories:
${
  session.getVisitedDirectories().length
    ? session.getVisitedDirectories().map(dir => `- ${dir}`).join("\n")
    : "None"
}

--------------------------------

Recovery History:
${
  session.getRecoveryHistory().length
    ? session.getRecoveryHistory().map(item => `- ${item}`).join("\n")
    : "None"
}
`;
}
  private verify(plan: Plan, observation: Observation) {
    return this.verifier.verify(plan, observation);
  }
  private async finishExecution(
    executionId: string,
    conversationId: string,
    result: ExecutionResult,
  ): Promise<AgentResponse> {
    await this.executionRepository.updateStatus(
      executionId,
      ExecutionStatus.SUCCESS,
    );

    await this.messageRepository.create(
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
  private async failExecution(
    executionId: string,
    conversationId: string,
    message: string,
  ): Promise<AgentResponse> {
    await this.executionRepository.updateStatus(
      executionId,
      ExecutionStatus.FAILED,
    );

    return {
      success: false,
      response: message,
      conversationId,
    };
  }
  private shouldRetry(
    verification: VerificationResult,
    observation: Observation,
    retryCount: number,
  ): boolean {
    if (retryCount >= this.MAX_ITERATIONS - 1) {
      return false;
    }

    switch (verification.status) {
      case "completed":
        return false;

      case "continue":
        return true;

      case "failed":
        return observation.recoverable;

      default:
        return false;
    }
  }
  async executePlan(
  plan: Plan,
  emitter?: AgentEventEmitter,
): Promise<ExecutionResult> {
  // Validate plan
  this.validator.validate(plan);

  // Create a conversation for manual execution
  const conversation = await this.conversationRepository.create(
    "Manual Plan Execution",
  );

  // Create execution
  const execution = await this.executionRepository.create(
    conversation.id,
    "Manual Plan Execution",
  );

  // Execute plan
  const result = await this.executor.execute(
    execution.id,
    plan,
    emitter,
  );

  // Update execution status
  await this.executionRepository.updateStatus(
    execution.id,
    result.success
      ? ExecutionStatus.SUCCESS
      : ExecutionStatus.FAILED,
  );

  // Save assistant message
  await this.messageRepository.create(
    conversation.id,
    Role.ASSISTANT,
    result.output,
  );

  return result;
}
}
