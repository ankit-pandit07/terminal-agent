import type { ToolDefinition } from "./tool.definition.js";

export const terminalDefinition: ToolDefinition = {
  name: "terminal",
  description:
    "Executes valid CLI commands in the workspace terminal (e.g. git status, node -v, ls, npm test).",
  usage: [
    'Execute git status: {"tool": "terminal", "input": {"command": "git status"}}',
    'Check node version: {"tool": "terminal", "input": {"command": "node -v"}}',
    'List files: {"tool": "terminal", "input": {"command": "ls"}}',
    'Print working directory: {"tool": "terminal", "input": {"command": "pwd"}}',
    'Run tests: {"tool": "terminal", "input": {"command": "npm test"}}',
  ],
};
