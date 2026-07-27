import { ExecutorService } from "../executor/executor.service.js";
import { PlannerService } from "../planner/planner.service.js";
import type { AgentRequest, AgentResponse } from "./agent.js";

export class AgentService{
    private planner=new PlannerService();
    private executor=new ExecutorService();

    async process(request:AgentRequest):Promise<AgentResponse>{
        const plan=await this.planner.createPlan(request.message);
        const result= await this.executor.execute(plan);

        return{
            success:result.success,
            response:result.output
        }
    }
}