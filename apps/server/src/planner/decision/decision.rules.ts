import type { IntentAnalysis } from "../analyzers/intent.types.js";
import type { TaskAnalysis } from "../analyzers/task.types.js";
import type { DecisionResult } from "./decision.types.js";

export class DecisionRules {
  decide(
    intent: IntentAnalysis,
    task: TaskAnalysis,
  ): DecisionResult {
    if (task.type === "terminal") {
      return {
        decision: "terminal",
        reason: "Terminal task detected",
        useLLM: false,
      };
    }

    if (
      intent.intent === "create" &&
      task.type === "single-file"
    ) {
      return {
        decision: "file",
        reason: "Simple file creation",
        useLLM: false,
      };
    }

    if (task.type === "search") {
      return {
        decision: "search",
        reason: "Search request",
        useLLM: false,
      };
    }

    return {
      decision: "planner",
      reason: "Complex task",
      useLLM: true,
    };
  }
}