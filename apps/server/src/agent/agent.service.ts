import { prisma } from "../../db/prisma.js";
import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import type { AgentRequest, AgentResponse } from "./agent.js";
import { ConversationMemory } from "./memory.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import type { Conversation } from "@prisma/client";


export class AgentService{
    private planner=new PlannerService();
    private executor=new ExecutorService();
    private memory=new ConversationMemory();
    private conversationRepository=new ConversationRepository();


    private buildContext(history:Conversation[]){
        return history.reverse().map(
            (c)=>`User:${c.message}
            Assistant:${c.response}`
        )
        .join("\n\n")
    }

    async process(request:AgentRequest):Promise<AgentResponse>{
        this.memory.add("user", request.message);
          const history=await this.conversationRepository.findRecent(10);
        const context = this.buildContext(history);
        const plan=await this.planner.createPlan(
            request.message,
            context
        );
        const result= await this.executor.execute(plan);
        this.memory.add("assistant", result.output);
        await this.conversationRepository.create(
            request.message,
            result.output
        )

        return {
    success: result.success,
    response: result.output,
};

    }
    async getHistory() {
    return this.conversationRepository.findAll();
}
}