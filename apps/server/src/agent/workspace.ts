import { WorkspaceService } from "../workspace/workspace.service.js";

const workspaceService = new WorkspaceService();

export async function getWorkspace() {
  return workspaceService.analyze();
}