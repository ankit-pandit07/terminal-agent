import type { PlanningRule } from "../rule.interface.js";
import type { RuleContext, RuleResult } from "../rule.types.js";

export class FileRule implements PlanningRule {
  name = "file";

  match(context: RuleContext): boolean {
    const text = context.message.toLowerCase().trim();

    return (
      text.startsWith("create file") ||
      text.startsWith("create ") ||
      text.startsWith("read ") ||
      text.startsWith("open ") ||
      text.startsWith("delete ") ||
      text.startsWith("edit ") ||
      text.startsWith("write ")
    );
  }

  execute(context: RuleContext): RuleResult {
    const text = context.message.trim();
    const lower = text.toLowerCase();

    if (lower.startsWith("create")) {
      const filePath = text
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
                path: filePath,
              },
            },
          ],
        },
      };
    }

    if (lower.startsWith("read") || lower.startsWith("open")) {
      const filePath = text.replace(/^read/i, "").replace(/^open/i, "").trim();

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
                path: filePath,
              },
            },
          ],
        },
      };
    }

    if (lower.startsWith("delete")) {
      const filePath = text.replace(/^delete/i, "").trim();

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
                path: filePath,
              },
            },
          ],
        },
      };
    }

    if (lower.startsWith("write")) {
      const writeText = text.replace(/^write/i, "").trim();

      const firstSpace = writeText.indexOf(" ");

      if (firstSpace === -1) {
        return {
          matched: false,
          confidence: 0,
        };
      }

      const filePath = writeText.slice(0, firstSpace).trim();

      const content = writeText.slice(firstSpace + 1);

      if (!filePath || !content) {
        return {
          matched: false,
          confidence: 0,
        };
      }

      return {
        matched: true,
        confidence: 1,
        plan: {
          source: "rule",
          steps: [
            {
              tool: "file",
              input: {
                action: "write",
                path: filePath,
                content,
              },
            },
          ],
        },
      };
    }

    if (lower.startsWith("edit")) {
      const filePath = text.replace(/^edit/i, "").trim();

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
                path: filePath,
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
