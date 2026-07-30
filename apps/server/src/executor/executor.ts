import type { AgentEventEmitter } from "../events/agent-event-emitter.js";
import type{ Plan } from "../planner/planner.js";

export interface ExecutionResult{
    success:boolean;
    output:string;
    completed:boolean;
    observation?:string;
}

export interface Executor{
    execute(executionId: string,plan:Plan,emitter?: AgentEventEmitter):Promise<ExecutionResult>
}