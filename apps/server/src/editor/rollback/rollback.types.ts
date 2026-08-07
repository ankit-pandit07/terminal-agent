export interface Backup {
  originalPath: string;
  backupPath: string;
  createdAt: Date;
}

export interface RollbackResult {
  success: boolean;
  restored: boolean;
  message: string;
}
