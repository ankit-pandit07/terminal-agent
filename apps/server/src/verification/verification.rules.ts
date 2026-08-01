import type { Observation } from "../observation/observation.js";
import type { Plan } from "../planner/planner.js";

export class VerificationRules {
  static isCompleted(plan: Plan): boolean {
    return plan.steps.length === 0;
  }

  static hasFailed(observation: Observation): boolean {
    return !observation.success;
  }

  static shouldContinue(
    plan: Plan,
    observation: Observation,
  ): boolean {
    return (
      observation.success &&
      plan.steps.length > 0
    );
  }
}