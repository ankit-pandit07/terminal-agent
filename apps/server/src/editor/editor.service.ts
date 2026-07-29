import { LLMFactory } from "../llm/llm.factory.js";
import { buildEditorPrompt } from "./editor.prompt.js";

export class EditorService{
    private llm=LLMFactory.create();

    async edit(
        fileContent:string,
        instruction:string,
    ):Promise<string>{

        const prompt=buildEditorPrompt(
            fileContent,
            instruction
        );

        const response=await this.llm.generate({
            prompt,
        });
    console.log("\n========== EDITOR PROMPT ==========");
    console.log(prompt);

    console.log("\n========== RAW LLM RESPONSE ==========");
    console.log(response.text);

    console.log("=====================================\n");
        return response.text.trim();
    }
}