import { toolDefinitions } from "../tools/definitions/index.js";
import type { Plan } from "./planner.js";

export class PlanValidator {
  private readonly availableTools = new Set(
    toolDefinitions.map((tool) => tool.name),
  );

  validate(plan: Plan): void {
    if (!plan) {
      throw new Error("Planner returned an empty plan.");
    }

    if (!Array.isArray(plan.steps)) {
      throw new Error("Plan must contain a steps array.");
    }

    if (plan.steps.length > 20) {
      throw new Error("Plan exceeds the maximum allowed number of steps.");
    }

    plan.steps.forEach((step, index) => {
      if (!step.tool) {
        throw new Error(`Step ${index + 1}: Missing tool.`);
      }
      if (!this.availableTools.has(step.tool)) {
        throw new Error(`Step ${index + 1}: Unknown tool "${step.tool}".`);
      }
      if (!step.input) {
        throw new Error(`Step ${index + 1}: Missing input.`);
      }

      this.validateInput(step.tool, step.input, index);
    });
  }
  private validateInput(tool: string, input: any, index: number) {
    switch (tool) {
      case "terminal":
        if (typeof input.command !== "string" || input.command.trim() === "") {
          throw new Error(`Step ${index + 1}: Terminal command is required.`);
        }
        break;

      case "file":
        if (typeof input.path !== "string" || input.path.trim() === "") {
          throw new Error(`Step ${index + 1}: File path is required.`);
        }
        if (typeof input.action !== "string" || input.action.trim() === "") {
          throw new Error(`Step ${index + 1}: File action is required.`);
        }
        break;

      case "directory":
        if (typeof input.path !== "string" || input.path.trim() === "") {
          throw new Error(`Step ${index + 1}: Directory path is required.`);
        }
        break;

      case "search":
        if (typeof input.query !== "string" || input.query.trim() === "") {
          throw new Error(`Step ${index + 1}: Search query is required.`);
        }
        break;
    }
  }
}
