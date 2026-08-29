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
    const text = context.message.trim();
    const lower = text.toLowerCase();

    let command = text;

    if (lower.startsWith("npm ") || lower.startsWith("npx ")) {
      command = text;
    } else if (lower.includes("run dev")) {
      command = "npm run dev";
    } else if (lower.includes("run build")) {
      command = "npm run build";
    } else if (lower.includes("run test")) {
      command = "npm test";
    } else if (lower.includes("install package")) {
      command = "npm install";
    } else {
      const npmIdx = lower.indexOf("npm ");
      const npxIdx = lower.indexOf("npx ");
      if (npmIdx !== -1) {
        command = text.substring(npmIdx).trim();
      } else if (npxIdx !== -1) {
        command = text.substring(npxIdx).trim();
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
