import { WorkspaceIndexer } from "../../workspace/indexer/workspace.indexer.js";
import { ContextRanker } from "./context.ranker.js";

export class ContextRetriever {
  private indexer = new WorkspaceIndexer();

  private ranker = new ContextRanker();

  async retrieve(query: string) {
    const workspace = await this.indexer.index();

    const files = workspace.files

      .filter((file) => file.type === "file")

      .map((file) => file.path);

    return this.ranker.rank(
      query,

      files,
    );
  }
}
