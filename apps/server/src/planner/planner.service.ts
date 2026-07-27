import type{ Plan } from "./planner.js";

export class PlannerService{
    createPlan(message:string):Plan{
        return {
            tool:"terminal",
            input:{
                command:message
            }
        }
    }
}
