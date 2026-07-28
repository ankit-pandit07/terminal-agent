import { LLMFactory } from "../llm/llm.factory.js";
import type { Plan } from "./planner.js";
import { JsonParser } from "../parser/json.parser.js";
import { buildPlannerPrompt } from "../prompts/planner.prompt.js";

export class PlannerService {
    
  private llm = LLMFactory.create();
  private parser=new JsonParser();

  async createPlan(message: string): Promise<Plan> {

const prompt = buildPlannerPrompt(message);
    const response = await this.llm.generate({
      prompt,
    });
   
    return this.parser.parse(response.text);
  }
}
