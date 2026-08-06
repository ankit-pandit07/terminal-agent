import type {
  RuleContext,
  RuleResult,
} from "./rule.types.js";

export interface PlanningRule {
  name: string;

  match(
    context: RuleContext,
  ): boolean;

  execute(
    context: RuleContext,
  ): RuleResult;
}