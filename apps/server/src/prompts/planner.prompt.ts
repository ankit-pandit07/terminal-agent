import { toolDefinitions } from "../tools/definitions/index.js";

export function buildPlannerPrompt(
  history: string,
  message: string,
  observation?: string,
    projectContext?: string
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
- Use the previous execution result to recover from errors.
- Do not generate the exact same failing command unless the observation suggests a retry may succeed.
- Prefer fixing the cause of the failure before continuing.

Conversation History:
${history}

Project Context:
${projectContext || "Unknown"}

Use the project context to choose frameworks, dependencies and file locations.
${
  observation
    ? `
Previous Execution Result:
${observation}



The previous execution may have failed.

Your job is to analyze the observation and produce the NEXT best plan.

Rules:
- Understand why the previous step failed.
- Do NOT blindly repeat the same action.
- If the error indicates a missing file, locate or create it.
- If the error indicates a wrong directory, navigate to the correct directory first.
- If the error indicates a missing dependency, install it.
- If retrying the same command is appropriate, do so only if it has a reasonable chance of succeeding.
- Continue working toward the user's original goal.
`
    : ""
}
Tool Selection Rules:

- Use "search" when you need to locate a file before editing it.
- Use "directory" to create or inspect folders.
- Use "file" to create, read, write or edit files.
- Use "terminal" only for shell commands.
- Never use the terminal to edit files.

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
- Never invent file names.
- Never invent project structure.
- If the required file is unknown, use the search tool first.

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
  Example 4

User:
Add a health route in src/app.ts

Correct Output:
{
  "steps": [
    {
      "tool": "file",
      "input": {
        "action": "edit",
        "path": "src/app.ts",
        "instruction": "Add a GET /health route."
      }
    }
  ]
}
User:
Install Express.

Previous Execution Result:
npm ERR! package.json not found

Correct Output:
{
  "steps": [
    {
      "tool": "terminal",
      "input": {
        "command": "pwd"
      }
    },
    {
      "tool": "terminal",
      "input": {
        "command": "ls"
      }
    }
  ]
}
Current User Message:
${message}
`;
}