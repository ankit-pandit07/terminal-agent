import type { ToolInput } from "../tools/base/tool.interface.js";
import { toolDefinitions } from "../tools/definitions/index.js";
import type { Plan } from "./planner.js";

export class PlanValidator {
  private readonly allowedFileActions = [
    "read",
    "write",
    "edit",
    "create",
    "delete",
  ] as const;
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
        throw new Error(
          `Step ${index + 1}: Unknown tool "${step.tool}". Available tools: ${[...this.availableTools].join(", ")}.`,
        );
      }
      if (!step.input) {
        throw new Error(`Step ${index + 1}: Missing input.`);
      }

      this.validateInput(step.tool, step.input, index);
    });
  }
  private validateInput(tool: string, input: ToolInput, index: number) {
    switch (tool) {
      case "terminal":
        const command = input.command;

        if (typeof command !== "string" || command.trim() === "") {
          throw new Error(`Step ${index + 1}: Terminal command is required.`);
        }

        if (command.length > 1000) {
          throw new Error(
            `Step ${index + 1}: Terminal command exceeds maximum length.`,
          );
        }
        break;

      case "file":
        if (typeof input.path !== "string" || input.path.trim() === "") {
          throw new Error(`Step ${index + 1}: File path is required.`);
        }

        if (
          typeof input.action !== "string" ||
          !this.allowedFileActions.includes(
            input.action as (typeof this.allowedFileActions)[number],
          )
        ) {
          throw new Error(
            `Step ${index + 1}: Invalid file action. Allowed actions: ${this.allowedFileActions.join(", ")}.`,
          );
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
