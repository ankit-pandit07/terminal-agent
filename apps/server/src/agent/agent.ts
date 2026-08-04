import type { AgentEventEmitter } from "../events/agent-event-emitter.js";

export interface AgentRequest {
  message: string;
  conversationId?: string;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  conversationId: string;
}

export type { AgentEventEmitter };