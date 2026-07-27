import { OllamaProvider } from "./ollama.provider.js";

export class LLMFactory{
    static create(){
        return new OllamaProvider();
    }
}