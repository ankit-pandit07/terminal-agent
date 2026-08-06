import type { Plan } from "../planner.js";

import { RuleRegistry } from "./rule.registry.js";
import { TerminalRule } from "./rules/terminal.rule.js";

export class RulePlanner {
  private registry = new RuleRegistry();

  constructor() {
    this.registry.register(new TerminalRule());
  }

  createPlan(message: string): Plan | null {
    for (const rule of this.registry.getRules()) {
      if (
        rule.match({
          message,
        })
      ) {
        return rule.execute({
          message,
        }).plan!;
      }
    }

    return null;
  }
}
