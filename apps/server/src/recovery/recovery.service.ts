import type { Observation } from "../observation/observation.js";
import { RecoveryStrategy } from "./recovery.strategy.js";
import type { RecoveryDecision } from "./recovery.types.js";

export class RecoveryService{
    private strategy=new RecoveryStrategy();

    decide(observation:Observation):RecoveryDecision{
        return this.strategy.decide(observation)
    }
}