import { prisma } from "../../db/prisma.js";
import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import type { AgentRequest, AgentResponse } from "./agent.js";
import { ConversationMemory } from "./memory.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";

export class AgentService{
    private planner=new PlannerService();
    private executor=new ExecutorService();
    private memory=new ConversationMemory();
    private conversationRepository=new ConversationRepository();

    async process(request:AgentRequest):Promise<AgentResponse>{
        this.memory.add("user", request.message);
        const plan=await this.planner.createPlan(request.message);
        const result= await this.executor.execute(plan);
        this.memory.add("assistant", result.output);
        await this.conversationRepository.create(
            request.message,
            result.output
        )

        await prisma.conversation.create({
            data:{
               message:request.message,
                response:String(result.output),
            },
        });

        return {
    success: result.success,
    response: result.output,
};
    }
}