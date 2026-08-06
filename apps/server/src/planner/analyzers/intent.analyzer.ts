import type {
  IntentAnalysis,
  UserIntent,
} from "./intent.types.js";

export class IntentAnalyzer {
  analyze(message: string): IntentAnalysis {
    const text = message.toLowerCase();

    const rules: Array<{
      words: string[];
      intent: UserIntent;
    }> = [
      {
        intent: "create",
        words: [
          "create",
          "make",
          "generate",
          "add",
          "build",
        ],
      },
      {
        intent: "edit",
        words: [
          "edit",
          "update",
          "modify",
          "change",
          "replace",
        ],
      },
      {
        intent: "read",
        words: [
          "read",
          "show",
          "display",
          "open",
          "view",
        ],
      },
      {
        intent: "delete",
        words: [
          "delete",
          "remove",
          "erase",
        ],
      },
      {
        intent: "search",
        words: [
          "find",
          "search",
          "locate",
        ],
      },
      {
        intent: "terminal",
        words: [
          "npm",
          "node",
          "git",
          "docker",
          "pnpm",
          "bun",
        ],
      },
    ];

    for (const rule of rules) {
      if (
        rule.words.some((word) =>
          text.includes(word),
        )
      ) {
        return {
          intent: rule.intent,
          confidence: 0.95,
          reason: `Matched keyword for '${rule.intent}'`,
        };
      }
    }

    return {
      intent: "unknown",
      confidence: 0,
      reason: "No matching keyword",
    };
  }
}