import type { LLMProvider, LLMRequest, LLMResponse } from "./llm.interface.js";
import { env } from "../config/env.js";

export class OllamaProvider implements LLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {

    const response=await fetch(
        `${env.OLLAMA_URL}/api/generate`,
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                model:"qwen2.5:3b",
                prompt:request.prompt,
                stream:false
            })
        }
    );

    const data=await response.json();

    return{
        text:data.response,
    }
  }
}
