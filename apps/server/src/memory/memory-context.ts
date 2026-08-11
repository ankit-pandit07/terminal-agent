import { rankMemories } from "./memory-ranker.js";
import { MemoryService } from "./memory.service.js";

const memoryService = new MemoryService();

export async function buildMemoryContext(query: string): Promise<string> {
  const memories = await memoryService.search({
    query,
  });

  const relevantMemories = rankMemories(query, memories);

  if (relevantMemories.length === 0) {
    return "No relevant agent memory found.";
  }

  return relevantMemories
    .slice(0, 10)
    .map((memory) => {
      return [
        `Type: ${memory.type}`,
        `Key: ${memory.key}`,
        `Value: ${memory.value}`,
        `Created: ${memory.createdAt.toISOString()}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}
