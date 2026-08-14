import type { Observation } from "../observation/observation.js";
import type { Plan } from "../planner/planner.js";
import type { VerificationResult } from "./verification.types.js";

export interface Verifier {
  verify(plan: Plan, observation: Observation): VerificationResult;
}
