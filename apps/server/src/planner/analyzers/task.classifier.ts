import type {
  TaskAnalysis,
  TaskType,
} from "./task.types.js";

export class TaskClassifier {
  classify(message: string): TaskAnalysis {
    const text = message.toLowerCase();

    const rules: Array<{
      words: string[];
      type: TaskType;
    }> = [
      {
        type: "terminal",
        words: [
          "npm",
          "npx",
          "node",
          "docker",
          "git",
          "pnpm",
          "bun",
          "run",
          "install",
          "prisma"
        ],
      },
      {
        type: "search",
        words: [
          "find",
          "search",
          "locate",
          "where",
        ],
      },
      {
        type: "project",
        words: [
          "entire project",
          "whole project",
          "every file",
          "all files",
          "project",
        ],
      },
      {
        type: "multi-file",
        words: [
          "authentication",
          "middleware",
          "jwt",
          "crud",
          "feature",
          "module",
        ],
      },
      {
        type: "single-file",
        words: [
          "function",
          "class",
          "component",
          "controller",
          "service",
        ],
      },
    ];

    for (const rule of rules) {
      if (
        rule.words.some(word =>
          text.includes(word),
        )
      ) {
        return {
          type: rule.type,
          confidence: 0.95,
          reason: `Matched '${rule.type}' rule`,
        };
      }
    }

    return {
      type: "unknown",
      confidence: 0,
      reason: "Unable to classify",
    };
  }
}