import type { MemoryRecord } from "./memory.types.js";

const TYPE_WEIGHT: Record<MemoryRecord["type"], number> = {
  conversation: 5,
  execution: 4,
  tool: 5,
  patch: 4,
  rollback: 5,
  workspace: 3,
};

export function rankMemories(
  query: string,
  memories: MemoryRecord[],
): MemoryRecord[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1);

  return memories
    .map((memory) => {
      const key = memory.key.toLowerCase();

      const value = memory.value.toLowerCase();

      const text = `${key} ${value}`;

      let score = 0;

      // 1. Keyword relevance
      for (const word of words) {
        if (text.includes(word)) {
          score += 2;
        }

        if (key.includes(word)) {
          score += 1;
        }
      }

      // 2. Memory type importance
      score += TYPE_WEIGHT[memory.type] ?? 0;

      // 3. Recent memory bonus
      const age = Date.now() - memory.createdAt.getTime();

      const hours = age / (1000 * 60 * 60);

      if (hours < 1) {
        score += 4;
      } else if (hours < 24) {
        score += 2;
      } else if (hours < 72) {
        score += 1;
      }

      return {
        memory,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.memory);
}
