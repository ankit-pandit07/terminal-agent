export type UserIntent =
  | "create"
  | "edit"
  | "read"
  | "delete"
  | "search"
  | "terminal"
  | "unknown";

export interface IntentAnalysis {
  intent: UserIntent;
  confidence: number;
  reason: string;
}