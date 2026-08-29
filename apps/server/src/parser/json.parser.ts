import type { Plan } from "../planner/planner.js";

export class JsonParser {
  parse(text: string): Plan {
    try {
      let cleaned = text.trim();
      const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch && markdownMatch[1]) {
        cleaned = markdownMatch[1].trim();
      } else {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
      }

      const plan = JSON.parse(cleaned);

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