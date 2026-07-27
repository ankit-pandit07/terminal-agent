import type { AgentRequest,AgentResponse } from "./agent.js";

export class AgentService {
    async process(
        request:AgentRequest
    ):Promise<AgentResponse>{

        return {
            success:true,
            response:`Agent received:${request.message}`
        }
    }
}