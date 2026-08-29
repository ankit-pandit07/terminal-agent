import type { ToolDefinition } from "./tool.definition.js";

export const fileDefinition: ToolDefinition = {
  name: "file",
  description:
    "Create, read, write, edit, or delete local workspace files on disk. NOT for attached chat files.",
  usage: [
    'Create file: {"tool": "file", "input": {"action": "create", "path": "src/app.ts"}}',
    'Read workspace file: {"tool": "file", "input": {"action": "read", "path": "package.json"}}',
    'Write file: {"tool": "file", "input": {"action": "write", "path": "README.md", "content": "..."}}',
    'Delete file: {"tool": "file", "input": {"action": "delete", "path": "temp.txt"}}',
    'Edit file: {"tool": "file", "input": {"action": "edit", "path": "src/app.ts", "oldText": "...", "newText": "..."}}',
  ],
};