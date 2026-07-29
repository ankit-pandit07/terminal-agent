import type { Tool, ToolInput, ToolOutput } from "../base/tool.interface.js";
import { promises as fs } from "fs";

export class FileTool implements Tool {
  name = "file";

  description = "Create, read and write files.";
public async readFile(path: string): Promise<string> {
  return await fs.readFile(path, "utf-8");
}

public async writeFile(path: string, content: string): Promise<void> {
  await fs.writeFile(path, content);
}
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
        const content = await this.readFile(path);
        return {
          success: true,
          data: content,
        };
      }

      case "write": {
        const path = String(input.path);
        const content = String(input.content);
        await this.writeFile(path, content);

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
