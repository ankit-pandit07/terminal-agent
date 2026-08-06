export type Decision =
  | "planner"
  | "file"
  | "terminal"
  | "search"
  | "directory";

export interface DecisionResult {
  decision: Decision;
  reason: string;
  useLLM: boolean;
}