import type { RetrievedContext } from "./context.types.js";

export class ContextRanker {
  rank(
    query: string,

    files: string[],
  ): RetrievedContext {
    const lower = query.toLowerCase();

    const relevant = files.filter((file) =>
      lower

        .split(/\s+/)

        .some((word) => file.toLowerCase().includes(word)),
    );

    return {
      relevantFiles: relevant,
      relevantSymbols: [],
      relevantCalls: [],
      score: relevant.length,
    };
  }
}
