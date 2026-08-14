export type RecoveryAction =
  | "retry"
  | "search"
  | "change-directory"
  | "replan"
  | "stop";

  export interface RecoveryDecision{
    action:RecoveryAction;
    reason:string;
    confidence:number;
  }