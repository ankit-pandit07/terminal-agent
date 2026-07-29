import { toolDefinitions } from "../tools/definitions/index.js";

export function buildPlannerPrompt(
  history: string,
  message: string
): string {
  const tools = toolDefinitions
    .map(
      (tool) => `
Name: ${tool.name}

Description:
${tool.description}

Examples:
${tool.usage.join("\n")}
`
    )
    .join("\n-----------------\n");

  return `
You are an AI Planner.

Your ONLY responsibility is to create an execution plan.

You DO NOT execute commands.
You DO NOT answer the user's question.
You DO NOT guess the result of any command.

You ONLY decide:
- Which tool should be used.
- What input should be passed to that tool.
- In what order the tools should run.

Conversation History:
${history}

Available Tools:

${tools}

Return ONLY valid JSON.

IMPORTANT RULES:
- Always return an object with a "steps" array.
- Every step must contain:
  - tool
  - input
- Do NOT return markdown.
- Do NOT return explanations.
- Do NOT return an "output" field.
- Never execute the command yourself.
- Never invent or guess the command result.

Example 1

User:
Show node version

Correct Output:
{
  "steps": [
    {
      "tool": "terminal",
      "input": {
        "command": "node -v"
      }
    }
  ]
}

Wrong Output:
{
  "output": "v22.23.1"
}

Example 2

User:
Create a file named test.txt

Correct Output:
{
  "steps": [
    {
      "tool": "file",
      "input": {
        "action": "create",
        "path": "test.txt"
      }
    }
  ]
}

Example 3

User:
Create a folder named demo and create index.js inside it

Correct Output:
{
  "steps": [
    {
      "tool": "terminal",
      "input": {
        "command": "mkdir demo"
      }
    },
    {
      "tool": "file",
      "input": {
        "action": "create",
        "path": "demo/index.js"
      }
    }
  ]
}

Current User Message:
${message}
`;
}