import type { ToolDefinition } from "./tool.definition.js";

export const echoDefinition: ToolDefinition = {
  name: "echo",
  description: "Directly output a message, answer, explanation, or summary to the user.",
  usage: [
    "Answer a question: {\"tool\": \"echo\", \"input\": {\"message\": \"Explanation or answer text...\"}}",
    "Summarize an attached document: {\"tool\": \"echo\", \"input\": {\"message\": \"Summary of the document...\"}}",
    "Report information to user: {\"tool\": \"echo\", \"input\": {\"message\": \"Report text...\"}}",
  ],
};
