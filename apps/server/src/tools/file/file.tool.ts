import type {
  Tool,
  ToolInfo,
  ToolInput,
  ToolOutput,
} from "../base/tool.interface.js";

import { promises as fs } from "fs";
import path from "node:path";
import { SessionState } from "../../session/session.state.js";
import { PatchService } from "../../editor/patch/patch.service.js";

export class FileTool implements Tool {
  name = "file";

  readonly info: ToolInfo = {
    name: "file",
    displayName: "File",
    description: "Read, write and manage files",

    category: "filesystem",

    version: "1.0.0",
    author: "NodeBase",

    enabled: true,

    capabilities: ["read", "write", "create", "delete", "edit"],
  };

  description = "Create, read, write, delete and edit files.";

  constructor(private session: SessionState) {}

  public resolvePath(filePath: string): string {
    return path.resolve(this.session.getCurrentDirectory(), filePath);
  }

  public async readFile(filePath: string): Promise<string> {
    const resolvedPath = this.resolvePath(filePath);

    return await fs.readFile(resolvedPath, "utf-8");
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    const resolvedPath = this.resolvePath(filePath);

    await fs.writeFile(resolvedPath, content, "utf-8");
  }

  private async createFile(filePath: string): Promise<ToolOutput> {
    try {
      const resolvedPath = this.resolvePath(filePath);

      await fs.writeFile(resolvedPath, "", "utf-8");

      this.session.setLastTool("file");
      this.session.clearLastError();
      this.session.addModifiedFile(resolvedPath);

      return {
        success: true,
        data: `File created: ${resolvedPath}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create file.";

      this.session.setLastError(message);

      return {
        success: false,
        data: message,
      };
    }
  }

  private async read(filePath: string): Promise<ToolOutput> {
    try {
      const resolvedPath = this.resolvePath(filePath);

      const content = await this.readFile(filePath);

      this.session.setLastTool("file");
      this.session.clearLastError();

      return {
        success: true,
        data: content,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to read file.";

      this.session.setLastError(message);

      return {
        success: false,
        data: message,
      };
    }
  }

  private async write(filePath: string, content: string): Promise<ToolOutput> {
    try {
      const resolvedPath = this.resolvePath(filePath);

      await this.writeFile(filePath, content);

      this.session.setLastTool("file");
      this.session.clearLastError();
      this.session.addModifiedFile(resolvedPath);

      return {
        success: true,
        data: `File written: ${resolvedPath}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to write file.";

      this.session.setLastError(message);

      return {
        success: false,
        data: message,
      };
    }
  }

  private async deleteFile(filePath: string): Promise<ToolOutput> {
    try {
      const resolvedPath = this.resolvePath(filePath);

      await fs.unlink(resolvedPath);

      this.session.setLastTool("file");
      this.session.clearLastError();
      this.session.addModifiedFile(resolvedPath);

      return {
        success: true,
        data: `File deleted: ${resolvedPath}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete file.";

      this.session.setLastError(message);

      return {
        success: false,
        data: message,
      };
    }
  }

  private async editFile(
    filePath: string,
    oldText: string,
    newText: string,
  ): Promise<ToolOutput> {
    try {
      const resolvedPath = this.resolvePath(filePath);

      // Read the current file content
      const oldContent = await fs.readFile(resolvedPath, "utf-8");

      // Check if the old text exists
      if (!oldContent.includes(oldText)) {
        return {
          success: false,
          data: "Text to replace was not found in the file.",
        };
      }

      // Replace the text
      const newContent = oldContent.replace(oldText, newText);

      // Check if any changes were made
      if (oldContent === newContent) {
        return {
          success: false,
          data: "No changes detected.",
        };
      }

      // Apply patch validation if needed
      try {
        const patchService = new PatchService();
        const result = patchService.apply(oldContent, newContent);

        if (!result.success) {
          return {
            success: false,
            data: "Patch validation failed.",
          };
        }

        // Write the patched content
        await fs.writeFile(resolvedPath, result.content, "utf-8");
      } catch (patchError) {
        // If PatchService is not available, just write the new content directly
        console.warn(
          "PatchService not available, writing directly:",
          patchError,
        );
        await fs.writeFile(resolvedPath, newContent, "utf-8");
      }

      // Update session state
      this.session.setLastTool("file");
      this.session.addModifiedFile(resolvedPath);
      this.session.clearLastError();

      return {
        success: true,
        data: `File edited successfully: ${resolvedPath}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit file.";

      this.session.setLastError(message);

      return {
        success: false,
        data: message,
      };
    }
  }

  async execute(input: ToolInput): Promise<ToolOutput> {
    const action = String(input.action ?? "").trim();

    const filePath = String(input.path ?? "").trim();

    if (!action) {
      return {
        success: false,
        data: "File action is required.",
      };
    }

    if (!filePath) {
      return {
        success: false,
        data: "File path is required.",
      };
    }

    switch (action) {
      case "create":
        return this.createFile(filePath);

      case "read":
        return this.read(filePath);

      case "write":
        return this.write(filePath, String(input.content ?? ""));

      case "delete": 
      case "remove": {
        const filePath = this.resolvePath(String(input.path));

        await fs.unlink(filePath);

        this.session.setLastTool("file");
        this.session.clearLastError();

        return {
          success: true,
          data: `File deleted: ${filePath}`,
        };
      }

      case "edit": {
        const oldText = String(input.oldText ?? "");
        const newText = String(input.newText ?? "");

        if (!oldText) {
          return {
            success: false,
            data: "Old text is required for edit.",
          };
        }

        return this.editFile(filePath, oldText, newText);
      }

      default:
        return {
          success: false,
          data: `Unknown file action: ${action}`,
        };
    }
  }
}
