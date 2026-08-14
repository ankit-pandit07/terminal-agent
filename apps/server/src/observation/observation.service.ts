import type { ToolMetadata } from "../tools/base/tool.interface.js";
import type { ObservationSeverity, Reflection } from "../observation/observation.js";
import type { Observation } from "./observation.js";

export class ObservationService {
  create(
    tool: string,
    success: boolean,
    output: string,
    metadata?: ToolMetadata,
    recovery?: Observation["recovery"],
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
      recovery,
      metadata,
    } as Observation;
  }
  createReflection(observation: Observation): Reflection {
    if (observation.success) {
      return {
        success: true,
        rootCause: "Execution completed successfully.",
        lesson: "Continue with the remaining execution plan.",
        nextAction: "Proceed to the next planned step.",
        confidence: 1,
        shouldRetry: false,
      };
    }

    if (observation.recovery?.attempted && observation.recovery.successful) {
      return {
        success: false,
        rootCause: observation.summary,
        lesson: observation.recovery.message,
        nextAction:
          observation.suggestion ??
          "Review the failure and retry with a safer approach.",
        confidence: 0.9,
        shouldRetry: observation.recoverable,
      };
    }
    if (observation.recovery?.attempted && !observation.recovery.successful) {
      return {
        success: false,
        rootCause: observation.summary,
        lesson: "The execution failed nad automatic roll also failed.",
        nextAction: "Stop retrying and invesatigation the rollback failure.",
        confidence: 0.95,
        shouldRetry: false,
      };
    }
    return {
      success: false,
      rootCause: observation.summary,
      lesson:observation.suggestion ?? "Invesatigate the execution failure.",
      nextAction: observation.suggestion ?? "Revise the execution plan.",
      confidence: observation.recoverable ? 0.9 : 0.6,
      shouldRetry: observation.recoverable,
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
      case "planner":
      case "executor":
        return tool as Observation["category"];

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
