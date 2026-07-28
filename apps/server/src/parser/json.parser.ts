
import type { Plan } from "../planner/planner.js";

export class JsonParser{
    parse(text:string):Plan{
        try {
            const plan=JSON.parse(text);

            if(!plan.tool || !plan.input){
                throw new Error("Invalid plan structure");

            }

            return plan as Plan;
        } catch {
            throw new Error("Invalid JSON returned by LLM")
        }
    }
}