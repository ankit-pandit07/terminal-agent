import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class PrismaRule implements PlanningRule {
  name = "prisma";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.startsWith("prisma ") ||
      text.startsWith("npx prisma ") ||
      text.includes("prisma generate") ||
      text.includes("prisma migrate") ||
      text.includes("prisma studio") ||
      text.includes("prisma db push") ||
      text.includes("prisma db pull") ||
      text.includes("prisma format")
    );
  }

  execute(context: RuleContext): RuleResult {
    return {
      matched: true,

      confidence: 1,

      plan: {
        source:"rule",
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
