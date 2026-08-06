import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class SearchRule implements PlanningRule {
  name = "search";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.startsWith("find ") ||
      text.startsWith("search ") ||
      text.includes("package.json")
    );
  }

  execute(context: RuleContext): RuleResult {
    const text = context.message;

    const query = text
      .replace(/^find\s+/i, "")
      .replace(/^search\s+/i, "")
      .trim();

    return {
      matched: true,

      confidence: 1,

      plan: {
         source: "rule",
        steps: [
          {
            tool: "search",

            input: {
              query,
            },
          },
        ],
      },
    };
  }
}
