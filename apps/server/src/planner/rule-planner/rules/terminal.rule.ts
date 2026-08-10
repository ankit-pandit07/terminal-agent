import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class TerminalRule implements PlanningRule {
  name = "terminal";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.includes("node version") ||
      text.includes("node -v") ||
      text.includes("node version?")
    );
  }

  execute(context: RuleContext): RuleResult {
    const text = context.message.toLowerCase();

    let command = context.message;

    if (text.includes("node version") || text.includes("node -v")) {
      command = "node -v";
    }

    return {
      matched: true,

      confidence: 1,

      plan: {
        source: "rule",

        steps: [
          {
            tool: "terminal",

            input: {
              command,
            },
          },
        ],
      },
    };
  }
}
