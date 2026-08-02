import type { Observation } from "../observation/observation.js";
import type { Plan } from "../planner/planner.js";

export class VerificationRules {
  static isCompleted(plan: Plan): boolean {
    return Array.isArray(plan.steps) && plan.steps.length === 0;
  }

  static hasFailed(observation: Observation): boolean {
    return !observation.success && observation.severity === "error";
  }

  static shouldContinue(plan: Plan, observation: Observation): boolean {
    return !this.hasFailed(observation) && !this.isCompleted(plan);
  }
}
