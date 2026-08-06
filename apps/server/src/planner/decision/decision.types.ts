export type Decision =
  | "planner"
  | "terminal"
  | "file"
  | "directory"
  | "search";

export interface DecisionResult {
  decision: Decision;
  useLLM: boolean;
  confidence: number;
  reason: string;
}