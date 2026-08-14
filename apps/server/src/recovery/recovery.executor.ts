import type { RecoveryDecision } from "./recovery.types.js";

export interface RecoveryExecutionResult {
  success: boolean;
  action: RecoveryDecision["action"];
  message: string;
  nextAction?: string;
}

export class RecoveryExecutor {
  execute(decision: RecoveryDecision): RecoveryExecutionResult {
    switch (decision.action) {
      case "retry":
        return {
          success: true,
          action: "retry",
          message: "Retrying the previous operation.",
          nextAction: "retry",
        };

      case "search":
        return {
          success: true,
          action: "search",
          message: "Search recovery selected.",
          nextAction: "search",
        };

      case "change-directory":
        return {
          success: true,
          action: "change-directory",
          message: "Directory recovery selected.",
          nextAction: "change-directory",
        };

      case "replan":
        return {
          success: true,
          action: "replan",
          message: "Re-planning is required.",
          nextAction: "replan",
        };

      case "stop":
        return {
          success: false,
          action: "stop",
          message: decision.reason,
        };

      default:
        return {
          success: false,
          action: "stop",
          message: "Unknown recovery action.",
        };
    }
  }
}
