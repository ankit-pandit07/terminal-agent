import type { PlanningRule } from "./rule.interface.js";

export class RuleRegistry {

  private rules: PlanningRule[] = [];

  register(rule: PlanningRule) {
    this.rules.push(rule);
  }

  getRules() {
    return this.rules;
  }

}