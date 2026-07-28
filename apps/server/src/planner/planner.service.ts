import { LLMFactory } from "../llm/llm.factory.js";
import type{ Plan } from "./planner.js";

export class PlannerService{
    private llm=LLMFactory.create();
   async createPlan(message:string):Promise<Plan>{
   const prompt = `
You are an AI planner.

Convert the user request into JSON.

Example:

User:
Show node version

Output:

{
  "tool":"terminal",
  "input":{
      "command":"node -v"
  }
}

User:

${message}

Return ONLY JSON.
`;

const response = await this.llm.generate({
    prompt,
})

console.log(response.text)
        return {
            tool:"terminal",
            input:{
                command:message
            }
        }
    }
}
