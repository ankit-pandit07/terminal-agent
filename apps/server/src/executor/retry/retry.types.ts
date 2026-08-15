import type { RecoveryDecision } from "../../recovery/recovery.types.js";

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  tool: string;
  error?: string;
  recovery: RecoveryDecision;
}

export interface RetryDecision {
  shouldRetry: boolean;
  reason: string;
}
