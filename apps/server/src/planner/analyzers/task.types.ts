export type TaskType =
  | "single-file"
  | "multi-file"
  | "project"
  | "terminal"
  | "search"
  | "unknown";

export interface TaskAnalysis {
  type: TaskType;
  confidence: number;
  reason: string;
}