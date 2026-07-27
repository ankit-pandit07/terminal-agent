import { LLMFactory } from "../llm/llm.factory.js";
import type{ Plan } from "./planner.js";

export class PlannerService{
    private llm=LLMFactory.create();
   async createPlan(message:string):Promise<Plan>{
    await this.llm.generate({
        prompt:message,
    })
        return {
            tool:"terminal",
            input:{
                command:message
            }
        }
    }
}
