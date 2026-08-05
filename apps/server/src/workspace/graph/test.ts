import { WorkspaceIndexer } from "../indexer/workspace.indexer.js";
import { GraphBuilder } from "./graph.builder.js";

const indexer = new WorkspaceIndexer();
const builder = new GraphBuilder();

const index = await indexer.index();

const graph = await builder.build(index.files);

console.log("\n========== PROJECT GRAPH ==========\n");

console.log("Nodes:", graph.nodes.length);
console.log("Edges:", graph.edges.length);

console.log("\nFirst 20 Edges:\n");

console.dir(graph.edges.slice(0, 20), {
  depth: null,
});