import { LLMFactory } from "../llm/llm.factory.js";
import { buildEditorPrompt } from "./editor.prompt.js";

export class EditorService {
  private llm = LLMFactory.create();
  private cleanOutput(text: string): string {
    return text
      .replace(/```[a-zA-Z]*/g, "")
      .replace(/```/g, "")
      .trim();
  }
  async edit(fileContent: string, instruction: string): Promise<string> {
    try{
        const prompt = buildEditorPrompt(fileContent, instruction);

    const response = await this.llm.generate({
      prompt,
    });
    const output = this.cleanOutput(response.text);

    if (!output) {
      throw new Error("Editor returned an empty response.");
    }

    return output;
  }catch(error){
    throw new Error(
        error instanceof Error ?
        error.message 
        : "Editor failed."
    )
  }
  }
}