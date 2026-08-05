import type { GoalEvaluation } from "./goal.types.js";

export class GoalParser {
  parse(text: string): GoalEvaluation {
    try {
      const goal = JSON.parse(text);

      if (typeof goal !== "object" || goal === null) {
        throw new Error();
      }

      return {
        completed: typeof goal.completed === "boolean" ? goal.completed : false,

        confidence: typeof goal.confidence === "number" ? goal.confidence : 1,

        reason:
          typeof goal.reason === "string" ? goal.reason : "No reason provided.",
      };
    } catch {
      return {
        completed: false,
        confidence: 0,
        reason: "Unable to evaluate goal.",
      };
    }
  }
}
