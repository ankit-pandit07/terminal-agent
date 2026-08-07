import type { AgentRequest, AgentResponse } from "../agent/agent.js";
import { processAgentRequest } from "../agent/process.js";


export class ChatApplication {

  async chat(
    request: AgentRequest,
  ): Promise<AgentResponse> {

    return processAgentRequest(
      request,
    );

  }

}