import { LLMFactory } from "../llm/llm.factory.js";
import { buildEditorPrompt } from "./editor.prompt.js";

export class EditorService {
  private llm = LLMFactory.create();
  private cleanOutput(text: string): string {
    return text
      .replace(/^```[a-zA-Z]*\n/, "")
      .replace(/\n```$/, "")
      .trim();
  }
  async edit(fileContent: string, instruction: string): Promise<string> {
    const prompt = buildEditorPrompt(fileContent, instruction);

    const response = await this.llm.generate({
      prompt,
    });
    return this.cleanOutput(response.text);
  }
}
