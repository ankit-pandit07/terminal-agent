import type{ Plan } from "../planner/planner.js";

export interface ExecutionResult{
    success:boolean;
    output:string;
}

export interface Executor{
    execute(plan:Plan):Promise<ExecutionResult>
}