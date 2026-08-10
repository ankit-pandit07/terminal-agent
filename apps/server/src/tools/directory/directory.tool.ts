import type {
  Tool,
  ToolInfo,
  ToolInput,
  ToolOutput,
} from "../base/tool.interface.js";
import path from "path";
import { promises as fs } from "fs";
import type { SessionState } from "../../session/session.state.js";
export class DirectoryTool implements Tool {
  name = "directory";
  readonly info: ToolInfo = {
    name: "directory",
    displayName: "Directory",
    description: "Create and manage directories",

    category: "filesystem",

    version: "1.0.0",
    author: "NodeBase",

    enabled: true,

    capabilities: ["create", "delete", "list"],
  };
  description = "Browse directories and list files.";

  constructor(private session: SessionState) {}

  async execute(input: ToolInput): Promise<ToolOutput> {
    const action = String(input.action);
    const currentDir = this.session.getCurrentDirectory();
    const target = input.path
      ? path.resolve(currentDir, String(input.path))
      : currentDir;

    switch (action) {
      case "create":
        return this.create(target);

      case "list":
        return this.list(target);

      case "tree":
        return this.tree(target);

      default:
        return {
          success: true,
          data: "Unknown action",
        };
    }
  }
  private async create(dir: string): Promise<ToolOutput> {
    try {
      this.session.setLastTool("directory");
      this.session.clearLastError();
      await fs.mkdir(dir, { recursive: true });

      return {
        success: true,
        data: `Directory created: ${dir}`,
      };
    } catch (err: any) {
      return {
        success: false,
        data: err.message,
      };
    }
  }
  private async list(dir: string): Promise<ToolOutput> {
    try {
      this.session.setLastTool("directory");
      this.session.clearLastError();
      const items = await fs.readdir(dir, {
        withFileTypes: true,
      });

      const result = items
        .map((item) => {
          const icon = item.isDirectory() ? "📁" : "📄";
          return `${icon} ${item.name}`;
        })
        .join("\n");

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      return {
        success: false,
        data: err.message,
      };
    }
  }

  private async tree(dir: string, prefix = ""): Promise<ToolOutput> {
    try {
      const output = await this.buildTree(dir, prefix);
      return {
        success: true,
        data: output,
      };
    } catch (err: any) {
      return {
        success: false,
        data: err.message,
      };
    }
  }

  private async buildTree(dir: string, prefix: string): Promise<string> {
    const entries = await fs.readdir(dir, {
      withFileTypes: true,
    });

    let result = "";

    for (const entry of entries) {
      result += `${prefix}${entry.name}\n`;

      if (entry.isDirectory()) {
        result += await this.buildTree(
          path.join(dir, entry.name),
          prefix + " ",
        );
      }
    }

    return result;
  }
}
