export interface AgentRequest {
    message:string;
      conversationId?: string;
    
}

export interface AgentResponse {
    success:boolean;
    response:string;
    conversationId:string;
}