export function buildEditorPrompt(
  fileContent: string,
  instruction: string
): string {
  return `
You are an expert TypeScript software engineer.

Your job is to MODIFY the existing source code.

You MUST follow these rules:

1. Return ONLY valid source code.
2. DO NOT return JSON.
3. DO NOT return YAML.
4. DO NOT return Markdown.
5. DO NOT use triple backticks.
6. DO NOT explain anything.
7. DO NOT summarize your changes.
8. Preserve all existing code unless the instruction requires changing it.
9. The output MUST be a complete replacement for the file.
10. The output MUST compile.

Instruction:
${instruction}

Existing source code:

${fileContent}

Return ONLY the updated source code.
`;
}