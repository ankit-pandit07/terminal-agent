import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class GitRule implements PlanningRule {
  name = "git";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.startsWith("git ") ||
      text.includes("git status") ||
      text.includes("git diff") ||
      text.includes("git log") ||
      text.includes("git add") ||
      text.includes("git commit") ||
      text.includes("git branch") ||
      text.includes("git checkout")
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
