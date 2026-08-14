import type { Observation } from "../observation/observation.js";
import type { RecoveryDecision } from "./recovery.types.js";

export class RecoveryStrategy {
  decide(observation: Observation): RecoveryDecision {
    const text =
      `${observation.summary} ${observation.errors.join(" ")}`.toLowerCase();

    if (
      text.includes("package.json") &&
      (text.includes("not found") || text.includes("enoent"))
    ) {
      return {
        action: "search",
        reason: "package.json is required but was not found.",
        confidence: 0.95,
      };
    }

    if (text.includes("enoent") || text.includes("not found")) {
      return {
        action: "search",
        reason: "The required file or resource was not found.",
        confidence: 0.9,
      };
    }

    if (text.includes("permission denied")) {
      return {
        action: "replan",
        reason: "The operation failed because of insufficient permissions.",
        confidence: 0.85,
      };
    }

    if (text.includes("timeout")) {
      return {
        action: "retry",
        reason: "The operation timed out and may succeed when retried.",
        confidence: 0.8,
      };
    }

    if (text.includes("already exists")) {
      return {
        action: "replan",
        reason:
          "The target already exists, so the original operation should not be repeated unchanged.",
        confidence: 0.9,
      };
    }

    if (observation.recoverable) {
      return {
        action: "replan",
        reason:
          "The failure appears recoverable but no specific recovery strategy was detected.",
        confidence: 0.6,
      };
    }

    return {
      action: "stop",
      reason: "The failure does not have a known recovery strategy.",
      confidence: 0.8,
    };
  }
}
