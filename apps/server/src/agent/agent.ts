import type { AgentEventEmitter } from "../events/agent-event-emitter.js";

export interface AgentRequest {
  message: string;
  conversationId?: string | undefined;
  userId?: string | undefined;
  fileIds?: string[] | undefined;
  authToken?: string | undefined;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  conversationId: string;
  requiresConfirmation?: boolean;
  confirmationId?: string;
}

export type { AgentEventEmitter };
