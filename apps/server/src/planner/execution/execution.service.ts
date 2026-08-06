import type { DirectExecutionRequest, DirectExecutionResult } from "./execution.js";

export class DirectExecutionService {
  async execute(
    request: DirectExecutionRequest,
  ): Promise<DirectExecutionResult> {
    return {
      success: true,

      output: request,
    };
  }
}
