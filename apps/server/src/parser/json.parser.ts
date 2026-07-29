import type { Plan } from "../planner/planner.js";

export class JsonParser {
  parse(text: string): Plan {
    try {
      const plan = JSON.parse(text);

      if (!plan.steps || !Array.isArray(plan.steps)) {
        throw new Error("Invalid plan structure");
      }

      for (const step of plan.steps) {
        if (!step.tool || !step.input) {
          throw new Error("Invalid step structure");
        }
      }

      return plan as Plan;
    } catch {
      throw new Error("Invalid JSON returned by LLM");
    }
  }
}