import { WorkspaceService } from "./workspace.service.js";

export class WorkspaceApplication {

  private workspace =
    new WorkspaceService();

  async analyze() {

    return this.workspace.analyze();

  }

}