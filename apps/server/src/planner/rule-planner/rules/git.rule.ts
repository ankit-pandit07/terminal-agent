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
    const text = context.message.trim();
    const lower = text.toLowerCase();

    let command = text;

    if (lower.startsWith("git ")) {
      command = text;
    } else if (lower.includes("git status")) {
      command = "git status";
    } else if (lower.includes("git diff")) {
      command = "git diff";
    } else if (lower.includes("git log")) {
      command = "git log";
    } else if (lower.includes("git branch")) {
      command = "git branch";
    } else {
      const gitIdx = lower.indexOf("git ");
      if (gitIdx !== -1) {
        command = text.substring(gitIdx).trim();
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
