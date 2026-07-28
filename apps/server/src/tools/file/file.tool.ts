import type { Tool, ToolInput, ToolOutput } from "../base/tool.interface.js";
import { promises as fs } from "fs";
export class FileTool implements Tool {
  name = "file";

  description = "Create, read and write files.";

  async execute(input: ToolInput): Promise<ToolOutput> {
    const action = String(input.action);

    switch (action) {
      case "create": {
        const path = String(input.path);

        await fs.writeFile(path, "");

        return {
          success: true,
          data: `File created: ${path}`,
        };
      }

      case "read": {
        const path = String(input.path);
        const content = await fs.readFile(path, "utf-8");
        return {
          success: true,
          data: content,
        };
      }

      case "write": {
        const path = String(input.path);
        const content = String(input.content);
        await fs.writeFile(path, content);

        return {
          success: true,
          data: "File updated",
        };
      }
      default:
        return {
          success: true,
          data: "Unknown action",
        };
    }
  }
}
