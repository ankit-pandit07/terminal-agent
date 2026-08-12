import fs from "fs/promises";
import path from "path";
import type { Backup } from "./rollback.types.js";

export class BackupService {
  async create(filePath: string): Promise<Backup> {
    const backupDir = path.join(process.cwd(), ".nodebase", "backups");
    await fs.mkdir(backupDir, { recursive: true });
    const backupPath = path.join(
      backupDir,
      `${Date.now()}-${path.basename(filePath)}`,
    );

    await fs.copyFile(filePath, backupPath);

    return {
      originalPath: filePath,
      backupPath,
      createdAt: new Date(),
    };
  }

  async delete(backup: Backup): Promise<void> {
    await fs.unlink(backup.backupPath);
  }
}
