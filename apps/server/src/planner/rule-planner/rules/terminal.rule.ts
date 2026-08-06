import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class TerminalRule implements PlanningRule {
  name = "terminal";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return text.includes("node version") || text.includes("node -v");
  }

  execute(context: RuleContext): RuleResult {
    return {
      matched: true,

      confidence: 1,

      plan: {
        steps: [
          {
            tool: "terminal",

            input: {
              command: "node -v",
            },
          },
        ],
      },
    };
  }
}
