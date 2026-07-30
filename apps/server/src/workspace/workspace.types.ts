export interface WorkspaceInfo {
  root: string;

  projectName?: string;

  packageManager: "npm" | "pnpm" | "yarn" | "bun" | "unknown";

  language: "typescript" | "javascript" | "unknown";

  framework?: string;

  database?: string;

  orm?: string;

  entryPoint?: string;

  dependencies: string[];

  devDependencies: string[];

  scripts: Record<string, string>;

  folders: string[];

  files: string[];

  hasGit: boolean;

  hasPrisma: boolean;

  hasDocker: boolean;
}