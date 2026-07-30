import { prisma } from "../../db/prisma.js";
import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import type { AgentRequest, AgentResponse } from "./agent.js";
import { ConversationMemory } from "./memory.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import type { Conversation } from "@prisma/client";

import { AgentState } from "./agent-state.js";

export class AgentService {
  private planner = new PlannerService();
  private executor = new ExecutorService();
  private memory = new ConversationMemory();
  private conversationRepository = new ConversationRepository();
  private readonly MAX_ITERATIONS = 5;
  private state = new AgentState();

  private buildContext(history: Conversation[]) {
    return [...history]
      .reverse()
      .map(
        (c) => `User:${c.message}
            Assistant:${c.response}`,
      )
      .join("\n\n");
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    this.state.goal = request.message;
    this.memory.add("user", request.message);
    const history = await this.conversationRepository.findRecent(10);
    const context = this.buildContext(history);
    let executionHistory = "";
    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      const plan = await this.planner.createPlan(
        request.message,
        context,
        executionHistory,
      );

      const result = await this.executor.execute(plan);

      if (result.completed) {
        this.memory.add("assistant", result.output);

        await this.conversationRepository.create(
          request.message,
          result.output,
        );

        return {
          success: result.success,
          response: result.output,
        };
      }

      const step = plan.steps[0];
      if (!step) {
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

    return {
      success: false,
      response: "Maximum reasoning iterations reached.",
    };
  }
  async getHistory() {
    return this.conversationRepository.findAll();
  }
}
