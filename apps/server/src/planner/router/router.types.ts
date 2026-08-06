import type { DecisionResult } from "../decision/decision.types.js";

export interface RouteResult {
  directExecution: boolean;
  decision: DecisionResult;
}