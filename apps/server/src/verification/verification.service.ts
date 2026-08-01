import type { Observation } from "../observation/observation.js";
import type { Plan } from "../planner/planner.js";
import { VerificationRules } from "./verification.rules.js";
import type { VerificationResult } from "./verification.types.js";
import type { Verifier } from "./verifier.js";

export class VerificationService implements Verifier {
    verify(plan: Plan, observation: Observation): VerificationResult {
        if(VerificationRules.isCompleted(plan)){
            return {
                status:"completed",
                reason:"No remaining steps in the execution plan."
            }
        }

        if(VerificationRules.hasFailed(observation)){
            return {
                status :"failed",
                reason:observation.summary,
            }
        }
        return {
            status:"continue",
            reason:"Execution should continue."
        }
    }
}