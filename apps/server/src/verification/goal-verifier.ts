import type { Observation } from "../observation/observation.js";
import type { VerificationResult } from "./verification.types.js";

export class GoalVerifier {
  verify(goal: string, observation: Observation): VerificationResult {
    if (!observation.success) {
      return {
        status: "failed",
        reason: `[${observation.tool}] ${observation.summary}`,
      };
    }

    const goalText = goal.toLowerCase();
    const output = [observation.summary, ...observation.facts]
      .join(" ")
      .toLowerCase();

    // Installation goals
    if (goalText.includes("install")) {
  if (
    output.includes("installed") ||
    output.includes("added")
  ) {
        return {
          status: "completed",
          reason: "The requested installation appears to be complete.",
        };
      }

      return {
        status: "continue",
        reason: "The installation goal has not been verified yet.",
      };
    }

    // Create goals
    if (goalText.includes("create")) {
      if (output.includes("created") || output.includes("successfully")) {
        return {
          status: "completed",
          reason: "The requested resource appears to have been created.",
        };
      }

      return {
        status: "continue",
        reason: "The creation goal has not been verified yet.",
      };
    }

    // Delete goals
    if (goalText.includes("delete") || goalText.includes("remove")) {
      if (
        output.includes("deleted") ||
        output.includes("removed") ||
        output.includes("successfully")
      ) {
        return {
          status: "completed",
          reason: "The requested resource appears to have been removed.",
        };
      }

      return {
        status: "continue",
        reason: "The deletion goal has not been verified yet.",
      };
    }

    // Generic successful execution
    return {
      status: "completed",
      reason: "The requested operation completed successfully.",
    };
  }
}
