import type { ToolDefinition } from "./tool.definition.js";

export const terminalDefinition: ToolDefinition = {
  name: "terminal",

  description: "Executes terminal commands on the local machine.",

  usage: [
    "Show node version",
    "Show npm version",
    "List files",
    "Print current directory",
    "Run npm install",
  ],
};
