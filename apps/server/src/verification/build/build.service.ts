import { BuildDetector } from "./build.detector.js";
import { BuildRunner } from "./build.runner.js";

import type { WorkspaceInfo } from "../../workspace/workspace.types.js";
import type { BuildResult } from "./build.types.js";

export class BuildService {
  private detector = new BuildDetector();
  private runner = new BuildRunner();

  async verify(workspace: WorkspaceInfo): Promise<BuildResult> {
    const command = this.detector.detect(workspace);

    return this.runner.run(command);
  }
}
