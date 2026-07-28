import { fileDefinition } from "../tools/definitinons/file.definition.js";
import { terminalDefinition } from "../tools/definitions/terminal.definition.js";


export function buildPlannerPrompt(
  history: string,
  message: string
): string {
  return `
You are an AI Planner.

Your job is to generate an execution plan.

Conversation History:
${history}

Available Tools:

Name: ${terminalDefinition.name}
Description:
${terminalDefinition.description}
Examples:
${terminalDefinition.usage.join("\n")}

Name: ${fileDefinition.name}
Description:
${fileDefinition.description}
Examples:
${fileDefinition.usage.join("\n")}

Return ONLY valid JSON.

Example 1:

User:
Show node version

Output:
{
  "tool": "terminal",
  "input": {
    "command": "node -v"
  }
}

Example 2:

User:
Create a file named test.txt

Output:
{
  "tool": "file",
  "input": {
    "action": "create",
    "path": "test.txt"
  }
}

Current User Message:
${message}
`;
}