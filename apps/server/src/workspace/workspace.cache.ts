import type { WorkspaceInfo } from "./workspace.types.js";

export class WorkspaceCache {
  private workspace?: WorkspaceInfo;

  get(): WorkspaceInfo | undefined {
    return this.workspace;
  }

  set(workspace: WorkspaceInfo): void {
    this.workspace = workspace;
  }

  clear(): void {
    this.workspace = undefined;
  }

  has(): boolean {
    return this.workspace !== undefined;
  }
}