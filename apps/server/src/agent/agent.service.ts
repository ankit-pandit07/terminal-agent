import { Role, ExecutionStatus } from "@prisma/client";

import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";

import type { AgentRequest, AgentResponse } from "./agent.js";

import { ConversationMemory } from "./memory.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";

import { AgentState } from "./agent-state.js";

export class AgentService {
  private planner = new PlannerService();
  private executor = new ExecutorService();

  private memory = new ConversationMemory();

  private conversationRepository = new ConversationRepository();
  private messageRepository = new MessageRepository();
  private executionRepository = new ExecutionRepository();

  private readonly MAX_ITERATIONS = 5;

  private state = new AgentState();

  async process(request: AgentRequest): Promise<AgentResponse> {
    let execution: { id: string } | null = null;

    try {
      this.state.goal = request.message;
      this.memory.add("user", request.message);

      // Create Conversation
      const conversation = await this.conversationRepository.create(
        request.message,
      );

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
      const context = this.memory
        .getHistory()
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      let executionHistory = "";

      for (let i = 0; i < this.MAX_ITERATIONS; i++) {
        const plan = await this.planner.createPlan(
          request.message,
          context,
          executionHistory,
        );

        const result = await this.executor.execute(
  execution.id,
  plan,
);

        if (result.completed) {
          await this.executionRepository.updateStatus(
            execution.id,
            ExecutionStatus.SUCCESS,
          );

          this.memory.add("assistant", result.output);

          await this.messageRepository.create(
            conversation.id,
            Role.ASSISTANT,
            result.output,
          );

          return {
            success: result.success,
            response: result.output,
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
          };
        }

        executionHistory += `
Tool: ${step.tool}

Input:
${JSON.stringify(step.input, null, 2)}

Result:
${result.output}

------------------------
`;
      }

      await this.executionRepository.updateStatus(
        execution.id,
        ExecutionStatus.FAILED,
      );

      return {
        success: false,
        response: "Maximum reasoning iterations reached.",
      };
    } catch (error) {
      if (execution) {
        await this.executionRepository.updateStatus(
          execution.id,
          ExecutionStatus.FAILED,
        );
      }

      throw error;
    }
  }

  async getHistory() {
    return this.conversationRepository.findAll();
  }
}
