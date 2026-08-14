import type {
  Tool,
  ToolInfo,
  ToolInput,
  ToolOutput,
} from "../base/tool.interface.js";


import { promises as fs } from "node:fs";
import path from "node:path";
import { SessionState } from "../../session/session.state.js";
import { PatchService } from "../../editor/patch/patch.service.js";
import { BackupService } from "../../editor/rollback/backup.service.js";
import { RollbackService } from "../../editor/rollback/rollback.service.js";
type FileSystem = typeof fs;

export class FileTool implements Tool {
  name = "file";

  private backupService = new BackupService();
  private rollbackService = new RollbackService();

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

  constructor(private session: SessionState,
    private fileSystem: FileSystem = fs,
  ) {}

  public resolvePath(filePath: string): string {
    return path.resolve(this.session.getCurrentDirectory(), filePath);
  }

  public async readFile(filePath: string): Promise<string> {
    const resolvedPath = this.resolvePath(filePath);

    return await this.fileSystem.readFile(resolvedPath, "utf-8");
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    const resolvedPath = this.resolvePath(filePath);

    await this.fileSystem.writeFile(resolvedPath, content, "utf-8");
  }

  private async createFile(filePath: string): Promise<ToolOutput> {
    try {
      const resolvedPath = this.resolvePath(filePath);

      await this.fileSystem.writeFile(resolvedPath, "", "utf-8");

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

      await this.fileSystem.unlink(resolvedPath);

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
    let backup;

    try {
      const resolvedPath = this.resolvePath(filePath);

      // 1. Read current content
      const oldContent = await this.fileSystem.readFile(resolvedPath, "utf-8");

      // 2. Check old text
      if (!oldContent.includes(oldText)) {
        return {
          success: false,
          data: "Text to replace was not found in the file.",
        };
      }

      // 3. Generate new content
      const newContent = oldContent.replace(oldText, newText);

      if (oldContent === newContent) {
        return {
          success: false,
          data: "No changes detected.",
        };
      }

      // 4. Create backup BEFORE modifying file
      backup = await this.backupService.create(resolvedPath);

      // 5. Apply and validate patch
      const patchService = new PatchService();

      const patchResult = patchService.apply(oldContent, newContent);

      if (!patchResult.success) {
        const rollback=await this.rollbackService.restore(backup);

        if(rollback.success){
          this.session.addRecovery(`Patch validation failed for ${resolvedPath}. Original file restored.`)
        }else{
          this.session.addRecovery(`Patch validation failed for ${resolvedPath}, and rollback failed:${rollback.message}`)
        }

        return {
          success: false,
          data: rollback.success ? "Patch validation failed. Original file restored." : `Patch validation failed and rollback failed: ${rollback.message}`,
        };
      }

      // 6. Write patched content
      await this.fileSystem.writeFile(resolvedPath, patchResult.content, "utf-8");

      // 7. Verify actual file content
      const verifiedContent = await this.fileSystem.readFile(resolvedPath, "utf-8");

      if (verifiedContent !== patchResult.content) {
        const rollback = await this.rollbackService.restore(backup);

        return {
          success: false,
          data: rollback.success
            ? "File verification failed. Original file restored."
            : `File verification failed and rollback failed: ${rollback.message}`,
        };
      }

      // 8. Update session
      this.session.setLastTool("file");
      this.session.addModifiedFile(resolvedPath);
      this.session.clearLastError();

      // 9. Backup is no longer needed
      await this.backupService.delete(backup);

      return {
        success: true,
        data: `File edited successfully: ${resolvedPath}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit file.";

      // 10. Automatic rollback on unexpected failure
      if (backup) {
        const rollback = await this.rollbackService.restore(backup);

        if (!rollback.success) {
          this.session.setLastError(`${message}. ${rollback.message}`);

          this.session.addRecovery(`Rollback failed for ${this.resolvePath}:${rollback.message}`)
          return {
            success: false,
            data: `${message}. Rollback also failed: ${rollback.message}`,
          };
        }

        this.session.setLastError(`${message}. Original file restored.`);
        this.session.addRecovery(`Rollback successful for ${this.resolvePath}. Original file restored.`)
        return {
          success: false,
          data: `${message}. Original file restored.`,
        };
      }

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

        await this.fileSystem.unlink(filePath);

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
