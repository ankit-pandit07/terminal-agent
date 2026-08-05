import type { ProjectFile } from "../indexer/file.scanner.js";
import type { GraphEdge, GraphNode, ProjectGraph } from "./graph.types.js";
import path from "path";
import { ImportParser } from "./import.parser.js";
import { ImportResolver } from "./import.resolver.js";

export class GraphBuilder {
  private parser = new ImportParser();
  private resolver = new ImportResolver();
  async build(
    files: ProjectFile[],
  ): Promise<ProjectGraph> {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const file of files) {
      nodes.push({
        id: file.path,
        path: file.path,
        type: file.type,
      });

      const parent = path.dirname(file.path);
      if (parent !== ".") {
        edges.push({
          from: parent,
          to: file.path,
          relation: "contains",
        });
      }
      for (const file of files) {
        if (file.type !== "file") continue;

        const imports = await this.parser.parse(file.path);

        for (const imported of imports) {
            const resolved=this.resolver.resolve(file.path, imported, files)
          edges.push({
            from: file.path,
            to: resolved ?? imported,
            relation: "imports",
          });
        }
      }
    }
    return {
      nodes,
      edges,
    };
  }
}
