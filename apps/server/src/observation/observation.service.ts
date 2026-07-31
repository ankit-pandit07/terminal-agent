import type { Observation } from "./observation.js";

export class ObservationService {
  create(tool: string, success: boolean, output: string): Observation {
    return {
      success,
      tool,
      category: this.detectCategory(tool),
      summary: this.buildSummary(success, output),
      facts: success ? [output] : [],
      errors: success ? [] : [output],
      timestamp: new Date(),
    };
  }
  private buildSummary(success: boolean, output: string): string {
    if (success) {
      return output;
    }
    return `Execution failed: ${output}`;
  }

  private detectCategory(tool: string): Observation["category"] {
    switch (tool) {
      case "terminal":
      case "file":
      case "directory":
      case "search":
      case "echo":
        return tool;

      default:
        return "unknown";
    }
  }
}
