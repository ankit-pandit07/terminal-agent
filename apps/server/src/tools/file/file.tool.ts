import type { Tool, ToolInput, ToolOutput } from "../base/tool.interface.js";
import { promises as fs } from "fs";
import path from "node:path";
import { SessionState } from "../../session/session.state.js";

export class FileTool implements Tool {
  name = "file";

  description = "Create, read and write files.";
  constructor(private session: SessionState) {}

  private resolvePath(filePath: string): string {
    return path.resolve(this.session.getCurrentDirectory(), filePath);
  }
public async readFile(filePath: string): Promise<string> {
  const resolvedPath = this.resolvePath(filePath);
  return await fs.readFile(resolvedPath, "utf-8");
}

public async writeFile(filePath: string, content: string): Promise<void> {
  const resolvedPath = this.resolvePath(filePath);
  await fs.writeFile(resolvedPath, content);
}
  async execute(input: ToolInput): Promise<ToolOutput> {
    const action = String(input.action);

    switch (action) {
      case "create": {
        const filePath = this.resolvePath(String(input.path));

        await fs.writeFile(filePath, "");

        return {
          success: true,
          data: `File created: ${filePath}`,
        };
      }

      case "read": {
        const filePath = this.resolvePath(String(input.path));
        const content = await this.readFile(filePath);
        return {
          success: true,
          data: content,
        };
      }

      case "write": {
        const filePath = this.resolvePath(String(input.path));
        const content = String(input.content);
        await this.writeFile(filePath, content);

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
