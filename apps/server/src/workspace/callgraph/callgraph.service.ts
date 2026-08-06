import type { CallEdge } from "./call.types.js";
import { CallGraphBuilder } from "./call.graph.js";

export class CallGraphService {
  private builder = new CallGraphBuilder();

  build(edges: CallEdge[]) {
    return this.builder.build(edges);
  }

  findCallees(
    graph: Map<string, string[]>,
    caller: string,
  ): string[] {
    return graph.get(caller) ?? [];
  }

  findCallers(
    graph: Map<string, string[]>,
    callee: string,
  ): string[] {
    const callers: string[] = [];

    for (const [caller, callees] of graph) {
      if (callees.includes(callee)) {
        callers.push(caller);
      }
    }

    return callers;
  }

  findRelated(
    graph: Map<string, string[]>,
    node: string,
  ): string[] {
    return [
      ...this.findCallers(graph, node),
      ...this.findCallees(graph, node),
    ];
  }
}