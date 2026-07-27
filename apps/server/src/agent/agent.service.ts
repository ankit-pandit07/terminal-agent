import { ToolRegistry } from "../tools/base/tool.registry.js";
import { EchoTool } from "../tools/echo/echo.tool.js";
import type { AgentRequest,AgentResponse } from "./agent.js";

export class AgentService {
    private registry=new ToolRegistry();

    constructor(){
        this.registry.register(new EchoTool());
    }
    async process(
        request:AgentRequest
    ):Promise<AgentResponse>{

        const tool=this.registry.get("echo");

        if(!tool){
        return {
            success:false,
            response:"Tool not found"
        }
    }

    const result=await tool.execute({
        message:request.message,
    });

    return {
        success:true,
        response:String(result.data)
    }
    }
}