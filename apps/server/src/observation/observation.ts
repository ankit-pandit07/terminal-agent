import type { ToolMetadata } from "../tools/base/tool.interface.js";
export type ObservationSeverity = "info" | "warning" | "error";

export interface Reflection {
  success: boolean;
  rootCause: string;
  lesson: string;
  nextAction: string;
  confidence: number;
  shouldRetry:boolean;
}

export type Observation = {
  success: boolean;
  tool: string;
  category: string;
  summary: string;
  facts: string[];
  errors: string[];
  timestamp: Date;
  severity: ObservationSeverity;
  recoverable: boolean;
  suggestion?: string;

  recovery?:{
    attempted:boolean;
    successful:boolean;
    message:string;
  }
  metadata?: ToolMetadata;
};

export class ObservationService {
  create(
    tool: string,
    success: boolean,
    output: string,
    metadata?: ToolMetadata
  ): Observation {
    const severity = this.detectSeverity(success);
    const recoverable = this.isRecoverable(output);
    const suggestion = this.buildSuggestion(output);

    return {
      success,
      tool,
      category: this.detectCategory(tool),
      summary: this.buildSummary(success, output),
      facts: success ? [output] : [],
      errors: success ? [] : [output],
      timestamp: new Date(),
      severity,
      recoverable,
      suggestion,
      metadata,
    } as Observation;
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
      case "planner":
      case "executor":
        return tool;

      default:
        return "unknown";
    }
  }

  private detectSeverity(success: boolean): ObservationSeverity {
    if (success) {
      return "info";
    }
    return "error";
  }

  private isRecoverable(output: string): boolean {
    const text = output.toLowerCase();

    return (
      text.includes("not found") ||
      text.includes("enoent") ||
      text.includes("permission denied") ||
      text.includes("already exists") ||
      text.includes("timeout")
    );
  }

  private buildSuggestion(output: string): string | undefined {
    const text = output.toLowerCase();

    if (text.includes("package.json")) {
      return "Search for package.json before running npm commands.";
    }

    if (text.includes("not found")) {
      return "Use the Search Tool to locate the required file.";
    }

    if (text.includes("permission")) {
      return "Verify file permissions before retrying.";
    }

    if (text.includes("already exists")) {
      return "Check whether the file or resource already exists before creating it again.";
    }

    return undefined;
  }
}