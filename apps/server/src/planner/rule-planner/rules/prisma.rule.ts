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
    const text = context.message.trim();
    const lower = text.toLowerCase();

    let command = text;

    if (lower.startsWith("npx prisma ") || lower.startsWith("prisma ")) {
      command = text;
    } else {
      const npxIdx = lower.indexOf("npx prisma ");
      const prismaIdx = lower.indexOf("prisma ");
      if (npxIdx !== -1) {
        command = text.substring(npxIdx).trim();
      } else if (prismaIdx !== -1) {
        command = `npx ${text.substring(prismaIdx).trim()}`;
      }
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
