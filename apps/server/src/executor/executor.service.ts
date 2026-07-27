import { ToolRegistry } from "../tools/base/tool.registry.js";
import { EchoTool } from "../tools/echo/echo.tool.js";
import { TerminalTool } from "../tools/terminal/terminal.tool.js";
import type { ExecutionResult, Executor } from "./executor.js";
import type{ Plan } from "../planner/planner.js";
export class ExecutorService implements Executor{
    private registry=new ToolRegistry();

    constructor(){
        this.registry.register(new EchoTool());
        this.registry.register(new TerminalTool())
    }

    async execute(plan: Plan): Promise<ExecutionResult> {
        const tool=this.registry.get(plan.tool);

        if(!tool){
            return {
                success:false,
                output:`Tool "${plan.tool}" not found`
            };
        }

        const result=await tool.execute(plan.input);

        return {
            success:result.success,
            output:String(result.data)
        }
    }
}