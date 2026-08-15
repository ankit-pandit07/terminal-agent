import type { RetryContext, RetryDecision } from "./retry.types.js";

export class RetryPolicy {
  shouldRetry(context: RetryContext): RetryDecision {
    if (context.attempt >= context.maxAttempts) {
      return {
        shouldRetry: false,
        reason: "Maximum retry attempts reached.",
      };
    }

    if (!context.error?.trim()) {
      return {
        shouldRetry: false,
        reason: "No error information available.",
      };
    }

    switch (context.recovery.action) {
      case "retry":
        return {
          shouldRetry: true,
          reason: context.recovery.reason,
        };

      case "search":
      case "replan":
        return {
          shouldRetry: false,
          reason:
            `Recovery action '${context.recovery.action}' ` +
            "requires a new plan before retrying.",
        };

      case "stop":
      default:
        return {
          shouldRetry: false,
          reason: context.recovery.reason,
        };
    }
  }
}
