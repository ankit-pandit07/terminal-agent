import { performance } from "node:perf_hooks";

import { TerminalTool } from "../../tools/terminal/terminal.tool.js";
import { SessionState } from "../../session/session.state.js";

import type { BuildCommand, BuildResult } from "./build.types.js";

export class BuildRunner {
  private session = new SessionState();
  private terminal = new TerminalTool(this.session);

  async run(build: BuildCommand): Promise<BuildResult> {
    if (!build.command) {
      return {
        success: true,
        command: "",
        stdout: "",
        stderr: "",
        exitCode: 0,
        duration: 0,
      };
    }

    const start = performance.now();
    const result = await this.terminal.execute({
      command: build.command,
    });

    const duration = performance.now() - start;
    return {
      success: result.success,
      command: build.command,
      stdout: result.metadata?.stdout ?? "",
      stderr: result.metadata?.stderr ?? "",
      exitCode: result.metadata?.exitCode ?? 0,
      duration,
    };
  }
}
