import type { LLMProvider, LLMRequest, LLMResponse } from "./llm.interface.js";
import { env } from "../config/env.js";

export class OllamaProvider implements LLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const payload: Record<string, unknown> = {
      model: "qwen2.5:3b",
      prompt: request.prompt,
      stream: false,
    };

    if (request.format) {
      payload.format = request.format;
    }

    if (request.system) {
      payload.system = request.system;
    }

    const response = await fetch(`${env.OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Ollama generate request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return {
      text: data.response ?? "",
    };
  }
}
