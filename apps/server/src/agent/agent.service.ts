import { prisma } from "../../db/prisma.js";
import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import type { AgentRequest, AgentResponse } from "./agent.js";
import { ConversationMemory } from "./memory.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import type { Conversation } from "@prisma/client";
import { SessionState } from "./session.js";
import { AgentState } from "./agent-state.js";
import { LLMFactory } from "../llm/llm.factory.js";
export class AgentService {
  private planner = new PlannerService();
  private executor = new ExecutorService();
  private memory = new ConversationMemory();
  private conversationRepository = new ConversationRepository();
  private session = new SessionState();
  private state = new AgentState();
  private llm=LLMFactory.create();
  

  private buildContext(history: Conversation[]) {
    return history
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
    let observation="";
    for (let i=0; i<5; i++){
      const plan=await this.planner.createPlan(
        request.message,
        context,
        observation
      );

      const result= await this.executor.execute(plan);

      if(result.completed){
        this.memory.add("assistant", result.output);

        await this.conversationRepository.create(
          request.message,
          result.output
        );

        return {
          success:result.success,
          response:result.output
        };
      }

      observation=result.observation ?? result.output;
    }

    return {
      success:false,
      response:"Maximum reasoing iterations reached."
    }
  }
  async getHistory() {
    return this.conversationRepository.findAll();
  }
}
