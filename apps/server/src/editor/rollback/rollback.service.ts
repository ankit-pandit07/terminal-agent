import fs from "fs/promises";
import type { Backup, RollbackResult } from "./rollback.types.js";

export class RollbackService {
  async restore(backup: Backup): Promise<RollbackResult> {
    try {
      await fs.copyFile(backup.backupPath, backup.originalPath);

      return {
        success: true,
        restored: true,
        message: "Rollback successful.",
      };
    } catch (error) {
      return {
        success: false,
        restored: false,
        message: error instanceof Error ? error.message : "Rollback failed.",
      };
    }
  }
}
