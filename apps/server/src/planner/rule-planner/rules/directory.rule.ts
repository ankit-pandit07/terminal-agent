import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class DirectoryRule implements PlanningRule {
  name = "directory";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.includes("list files") ||
      text.includes("show files") ||
      text.includes("list folders") ||
      text.includes("show folders") ||
      text.includes("current directory") ||
      text.includes("pwd") ||
      text.startsWith("cd ")
    );
  }

  execute(context: RuleContext): RuleResult {
    const text = context.message.toLowerCase();

    if (text.includes("current directory") || text.trim() === "pwd") {
      return {
        matched: true,
        confidence: 1,
        plan: {
          source: "rule",
          steps: [
            {
              tool: "terminal",
              input: {
                command: "pwd",
              },
            },
          ],
        },
      };
    }

    if (
      text.includes("list files") ||
      text.includes("show files") ||
      text.includes("list folders") ||
      text.includes("show folders")
    ) {
      return {
        matched: true,
        confidence: 1,
        plan: {
          source: "rule",
          steps: [
            {
              tool: "directory",
              input: {
                action: "list",
              },
            },
          ],
        },
      };
    }

    if (text.startsWith("cd ")) {
      return {
        matched: true,
        confidence: 1,
        plan: {
          source: "rule",
          steps: [
            {
              tool: "terminal",
              input: {
                command: context.message.trim(),
              },
            },
          ],
        },
      };
    }

    return {
      matched: false,
      confidence: 0,
    };
  }
}
