import type { Plan, PlanStep } from "../planner/planner.js";

export type SafetyLevel = "safe" | "warning" | "dangerous";
export interface SafetyResult {
  level: SafetyLevel;
  requiresConfirmation: boolean;
  reason: string;
  step?: PlanStep;
}

export class SafetyService {
  checkStep(step: PlanStep): SafetyResult {
    switch (step.tool) {
      case "file":
        return this.checkFile(step);

      case "directory":
        return this.checkDirectory(step);

      case "terminal":
        return this.checkTerminal(step);

      default:
        return {
          level: "safe",
          requiresConfirmation: false,
          reason: "Tool does not contain a known dangerous operation.",
          step,
        };
    }
  }

  checkPlan(plan: Plan): SafetyResult[] {
    return plan.steps.map((step) => this.checkStep(step));
  }

  private checkFile(step: PlanStep): SafetyResult {
    const action = String(step.input.action ?? "").toLowerCase();

    if (action === "delete" || action === "remove") {
      return {
        level: "dangerous",
        requiresConfirmation: true,
        reason: "Deleting a file may permanently remove user data.",
        step,
      };
    }

    if (action === "edit" || action === "write") {
      return {
        level: "warning",
        requiresConfirmation: false,
        reason: "This operation will modify an existing file.",
        step,
      };
    }

    return {
      level: "safe",
      requiresConfirmation: false,
      reason: "File operation is safe.",
      step,
    };
  }

  private checkDirectory(step: PlanStep): SafetyResult {
    const action = String(step.input.action ?? "").toLowerCase();

    if (action === "delete") {
      return {
        level: "dangerous",
        requiresConfirmation: true,
        reason: "Deleting a directory may permanently remove files.",
        step,
      };
    }

    return {
      level: "safe",
      requiresConfirmation: false,
      reason: "Directory operation is safe.",
      step,
    };
  }

  private checkTerminal(step: PlanStep): SafetyResult {
    const command = String(step.input.command ?? "")
      .trim()
      .toLowerCase();

     const dangerousPatterns = [
    "rm ",
    "rm -rf",
    "rm -r",
    "rmdir",
    "del ",
    "del /s",
    "del /f",
    "format ",
    "drop database",
    "drop table",
    "git reset --hard",
    "git clean -fd",
    "docker system prune",
    "docker volume prune",
  ];
    const matchedPattern = dangerousPatterns.find((pattern) =>
      command.includes(pattern),
    );

    if (matchedPattern) {
      return {
        level: "dangerous",
        requiresConfirmation: true,
        reason: `Dangerous terminal command detected: "${matchedPattern}".`,
        step,
      };
    }

    return {
      level: "safe",
      requiresConfirmation: false,
      reason: "Terminal command appears safe.",
      step,
    };
  }
}
