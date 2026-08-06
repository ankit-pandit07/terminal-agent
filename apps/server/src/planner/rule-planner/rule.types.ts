import type { Plan } from "../planner.js";

export interface RuleContext {
  message: string;
}

export interface RuleResult {
  matched: boolean;
  confidence: number;
  plan?: Plan;
}