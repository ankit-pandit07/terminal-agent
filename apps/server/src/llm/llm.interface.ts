export interface LLMRequest{
    prompt:string;
}

export interface LLMResponse{
    text:string;
}

export interface LLMProvider {
    generate(request:LLMRequest):Promise<LLMResponse>;
}