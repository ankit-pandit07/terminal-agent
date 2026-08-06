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
        useLLM: false,
        confidence: 0.99,
        reason: "Terminal task detected.",
      };
    }

    if (
      intent.intent === "create" &&
      task.type === "single-file"
    ) {
      return {
        decision: "file",
        useLLM: false,
        confidence: 0.95,
        reason: "Simple file creation.",
      };
    }

    if (
      intent.intent === "search" ||
      task.type === "search"
    ) {
      return {
        decision: "search",
        useLLM: false,
        confidence: 0.98,
        reason: "Search request.",
      };
    }

    return {
      decision: "planner",
      useLLM: true,
      confidence: 0.90,
      reason: "Complex task requires planning.",
    };
  }
}