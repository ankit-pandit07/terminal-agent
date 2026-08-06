import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class DirectoryRule implements PlanningRule {
  name = "directory";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.includes("list files") ||
      text.includes("show files") ||
      text.includes("current directory") ||
      text.includes("pwd") ||
      text.includes("list folders") ||
      text.includes("show folders") ||
      text.startsWith("cd ") ||
      text.startsWith("open folder")
    );
  }

  execute(context: RuleContext): RuleResult {
    const text = context.message.toLowerCase();

    if (text.includes("current directory") || text === "pwd") {
      return {
        matched: true,
        confidence: 1,
        plan: {
             source: "rule",
          steps: [
            {
              tool: "directory",
              input: {
                action: "pwd",
              },
            },
          ],
        },
      };
    }

    if (text.includes("list files") || text.includes("show files")) {
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
              tool: "directory",
              input: {
                action: "cd",
                path: context.message.substring(3).trim(),
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
