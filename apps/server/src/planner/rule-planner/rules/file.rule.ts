import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class FileRule implements PlanningRule {
  name = "file";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase();

    return (
      text.startsWith("create file") ||
      text.startsWith("create ") ||
      text.startsWith("read ") ||
      text.startsWith("open ") ||
      text.startsWith("delete ") ||
      text.startsWith("edit ")
    );
  }

  execute(context: RuleContext): RuleResult {
    const text = context.message.trim();
    const lower = text.toLowerCase();

    // CREATE
    if (lower.startsWith("create")) {
      const path = text
        .replace(/^create\s+file/i, "")
        .replace(/^create/i, "")
        .trim();

      return {
        matched: true,
        confidence: 1,
        plan: {
             source: "rule",
          steps: [
            {
              tool: "file",
              input: {
                action: "create",
                path,
              },
            },
          ],
        },
      };
    }

    // READ
    if (lower.startsWith("read") || lower.startsWith("open")) {
      const path = text.replace(/^read/i, "").replace(/^open/i, "").trim();

      return {
        matched: true,
        confidence: 1,
        plan: {
             source: "rule",
          steps: [
            {
              tool: "file",
              input: {
                action: "read",
                path,
              },
            },
          ],
        },
      };
    }

    // DELETE
    if (lower.startsWith("delete")) {
      const path = text.replace(/^delete/i, "").trim();

      return {
        matched: true,
        confidence: 1,
        plan: {
             source: "rule",
          steps: [
            {
              tool: "file",
              input: {
                action: "delete",
                path,
              },
            },
          ],
        },
      };
    }

    // EDIT
    if (lower.startsWith("edit")) {
      const path = text.replace(/^edit/i, "").trim();

      return {
        matched: true,
        confidence: 1,
        plan: {
             source: "rule",
          steps: [
            {
              tool: "file",
              input: {
                action: "edit",
                path,
                instruction: context.message,
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
