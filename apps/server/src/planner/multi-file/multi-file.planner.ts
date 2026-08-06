import type { WorkspaceInfo } from "../../workspace/workspace.types.js";
import { DependencyResolver } from "./dependency.resolver.js";
import { FileSelector } from "./file.selector.js";
import type { FileTask } from "./multi-file.types.js";

export class MultiFilePlanner {
  private selector = new FileSelector();

  private resolver = new DependencyResolver();

  createPlan(
    message: string,
    workspace: WorkspaceInfo,
  ): FileTask[] {

    const selected = this.selector.select(
      message,
      workspace,
    );

    return this.resolver.resolve(
      selected,
    );
  }
}