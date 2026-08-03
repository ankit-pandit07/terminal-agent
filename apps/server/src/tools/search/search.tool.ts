import { promises as fs } from "fs";
import path from "path";
import type { Tool, ToolInfo, ToolOutput } from "../base/tool.interface.js";
import type { SessionState } from "../../session/session.state.js";
export class SearchTool implements Tool {
  name = "search";
  readonly info: ToolInfo = {
    name: "search",
    displayName: "Search",
    description: "Search files and directories in the workspace",

    category: "search",

    version: "1.0.0",
    author: "NodeBase",

    enabled: true,

    capabilities: ["file-search", "directory-search", "pattern-search"],
  };
  description = "Search for next inside project files.";
  constructor(private session: SessionState) {}
  private ignored = new Set(["node_modules", ".git", "dist", "build"]);

  async findFile(
    fileName: string,
    root = this.session.getCurrentDirectory(),
  ): Promise<string | null> {
    return this.find(root, fileName);
  }

  private async find(dir: string, fileName: string): Promise<string | null> {
    const entries = await fs.readdir(dir, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      if (this.ignored.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const result = await this.find(fullPath, fileName);

        if (result) {
          return result;
        }

        continue;
      }

      if (entry.name === fileName) {
        return fullPath;
      }
    }

    return null;
  }

  async readIfExists(fileName: string): Promise<string | null> {
    const file = await this.findFile(fileName);

    if (!file) {
      return null;
    }

    return fs.readFile(file, "utf-8");
  }
  async execute(input: Record<string, unknown>): Promise<ToolOutput> {
    const query = String(input.query ?? "").trim();
    const root = input.path
      ? String(input.path)
      : this.session.getCurrentDirectory();

    this.session.setLastTool("search");
    this.session.clearLastError();

    if (!query) {
      const message = "Search query is empty.";

      this.session.setLastTool("search");
      this.session.setLastError(message);
      this.session.incrementRetryCount();

      return {
        success: false,
        data: message,
      };
    }
    const results: string[] = [];
    await this.search(root, query, results);

    return {
      success: true,
      data: results.length > 0 ? results.join("\n") : "No mathces found.",
    };
  }
  private async search(dir: string, query: string, results: string[]) {
    const entries = await fs.readdir(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (this.ignored.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.search(fullPath, query, results);
        continue;
      }

      try {
        const content = await fs.readFile(fullPath, "utf-8");
        const lines = content.split("\n");

        lines.forEach((line, index) => {
          if (line.includes(query)) {
            results.push(`${fullPath}:${index + 1}:${line.trim()}`);
          }
        });
      } catch {}
    }
  }
}
