import type { ToolDefinition } from "./tool.definition.js";

export const searchDefinition: ToolDefinition = {
  name: "search",
  description: "Search for text inside project files.",

  usage: [
    "Find TODO comments",
    "Search for 'express'",
    "Search for 'router.get'",
    "Find all occurrences of 'UserController'"
  ]
};