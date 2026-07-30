import { Role } from "@prisma/client";
import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import type { AgentRequest, AgentResponse } from "./agent.js";
import { ConversationMemory } from "./memory.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { AgentState } from "./agent-state.js";

export class AgentService {
  private planner = new PlannerService();
  private executor = new ExecutorService();
  private memory = new ConversationMemory();
  private conversationRepository = new ConversationRepository();
  private messageRepository = new MessageRepository();
  private readonly MAX_ITERATIONS = 5;
  private state = new AgentState();

  async process(request: AgentRequest): Promise<AgentResponse> {
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

      const result = await this.executor.execute(plan);

      if (result.completed) {
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
