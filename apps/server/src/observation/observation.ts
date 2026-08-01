export type ObservationSeverity = "info" | "warning" | "error";

export interface Observation {
  success: boolean;

  tool: string;

  category:
    | "terminal"
    | "file"
    | "directory"
    | "search"
    | "echo"
    | "planner"
    | "executor"
    | "unknown";

  summary: string;
  facts: string[];
  errors: string[];
  timestamp: Date;
  severity: ObservationSeverity;
  recoverable: boolean;
  suggestion?: string;
}
