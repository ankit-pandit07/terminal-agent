export interface LLMRequest {
  prompt: string;
  format?: "json" | Record<string, unknown>;
  system?: string;
}

export interface LLMResponse{
    text:string;
}

export interface LLMProvider {
    generate(request:LLMRequest):Promise<LLMResponse>;
}