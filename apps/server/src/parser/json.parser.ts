import type { Plan } from "../planner/planner.js";

export class JsonParser {
  parse(text: string): Plan {
    try {
      const plan = JSON.parse(text);

      if (typeof plan !== "object" || plan === null) {
        throw new Error("Planner response must be a JSON object.");
      }

      if (!Array.isArray(plan.steps)) {
        throw new Error("Planner response must contain a steps array.");
      }

      plan.steps.forEach((step: unknown, index: number) => {
        if (typeof step !== "object" || step === null) {
          throw new Error(`Step ${index + 1}: Invalid step.`);
        }

        const currentStep = step as Record<string, unknown>;

        if (typeof currentStep.tool !== "string") {
          throw new Error(`Step ${index + 1}: Missing or invalid tool.`);
        }

        if (
          typeof currentStep.input !== "object" ||
          currentStep.input === null
        ) {
          throw new Error(`Step ${index + 1}: Missing or invalid input.`);
        }
      });

      return plan as Plan;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown parsing error";

      throw new Error(
        `Failed to parse planner response: ${message}`,
      );
    }
  }
}