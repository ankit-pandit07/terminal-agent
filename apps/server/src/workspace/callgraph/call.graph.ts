import type { CallEdge } from "./call.types.js";

export class CallGraphBuilder {
  build(edges: CallEdge[]) {
    const graph = new Map<string, string[]>();

    for (const edge of edges) {
      const existing =
        graph.get(edge.caller) ?? [];

      existing.push(edge.callee);

      graph.set(edge.caller, existing);
    }

    return graph;
  }
}