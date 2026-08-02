import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import type { Observation } from "../observation/observation.js";
import type { Plan } from "../planner/planner.js";

export interface ExecutionResult {
  success: boolean;
  output: string;
  observation: Observation;
}

export interface Executor {
  execute(
    executionId: string,
    plan: Plan,
    emitter?: AgentEventEmitter,
  ): Promise<ExecutionResult>;
}
