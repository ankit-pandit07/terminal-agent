import type { WorkspaceInfo } from "../../workspace/workspace.types.js";
import type { FileTask } from "./multi-file.types.js";

export class FileSelector {
  select(message: string, workspace: WorkspaceInfo): FileTask[] {
    const text = message.toLowerCase();

    const result: FileTask[] = [];

    for (const file of workspace.files) {
      const path = file.toLowerCase();

      if (text.includes("auth") && path.includes("auth")) {
        result.push({
          path: file,
          reason: "Authentication related",
          priority: 100,
        });
      }

      if (text.includes("middleware") && path.includes("middleware")) {
        result.push({
          path: file,
          reason: "Middleware related",
          priority: 90,
        });
      }

      if (text.includes("route") && path.includes("route")) {
        result.push({
          path: file,
          reason: "Route related",
          priority: 80,
        });
      }

      if (path.endsWith("package.json")) {
        result.push({
          path: file,
          reason: "Dependencies",
          priority: 70,
        });
      }
    }

    return result;
  }
}
