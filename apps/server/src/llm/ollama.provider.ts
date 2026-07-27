import type { LLMProvider, LLMRequest, LLMResponse } from "./llm.interface.js";

export class OllamaProvider implements LLMProvider{
    async generate(request: LLMRequest): Promise<LLMResponse> {
        return {
            text:request.prompt
        }
    }
}