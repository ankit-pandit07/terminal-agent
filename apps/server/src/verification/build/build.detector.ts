import type { WorkspaceInfo } from "../../workspace/workspace.types.js";
import type { BuildCommand } from "./build.types.js";

export class BuildDetector {

  detect(
    workspace: WorkspaceInfo,
  ): BuildCommand {
    
    // Next.js
    if (workspace.framework?.toLowerCase() === "next.js") {
      return {
        command: "npm run build",
        reason: "Next.js project detected",
      };
    }

    // React
    if (workspace.framework?.toLowerCase() === "react") {
      return {
        command: "npm run build",
        reason: "React project detected",
      };
    }

    // Prisma
    if (workspace.hasPrisma) {
      return {
        command: "npx prisma validate",
        reason: "Prisma schema validation",
      };
    }

    // TypeScript
    if (workspace.language.toLowerCase() === "typescript") {
      return {
        command: "npx tsc --noEmit",
        reason: "TypeScript compilation check",
      };
    }

    // Node.js
    if (workspace.scripts.build) {
      return {
        command: "npm run build",
        reason: "Build script found",
      };
    }

    return {
      command: "",
      reason: "No verification available",
    };

  }

}