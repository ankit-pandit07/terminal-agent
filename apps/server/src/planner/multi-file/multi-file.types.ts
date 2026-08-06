export interface FileTask {
  path: string;

  reason: string;

  priority: number;
}

export interface MultiFilePlan {
  files: FileTask[];
}
