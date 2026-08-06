import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class NpmRule implements PlanningRule {
  name = "npm";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.startsWith("npm ") ||
      text.startsWith("npx ") ||
      text.includes("install package") ||
      text.includes("run dev") ||
      text.includes("run build") ||
      text.includes("run test")
    );
  }

  execute(context: RuleContext): RuleResult {
    return {
      matched: true,

      confidence: 1,

      plan: {
         source: "rule",
        steps: [
          {
            tool: "terminal",

            input: {
              command: context.message,
            },
          },
        ],
      },
    };
  }
}
