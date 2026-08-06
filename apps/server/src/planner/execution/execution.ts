export interface DirectExecutionRequest {
  tool: "terminal" | "file" | "search" | "directory";
  input: unknown;
}

export interface DirectExecutionResult {
  success: boolean;
  output: unknown;
}