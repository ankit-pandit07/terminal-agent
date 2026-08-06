import { FileScanner } from "../../workspace/indexer/file.scanner.js";
import { SymbolIndexer } from "../../workspace/symbols/symbol.indexer.js";

export class SymbolMatcher {
  private scanner = new FileScanner();
  private indexer = new SymbolIndexer();

  async match(root: string, query: string): Promise<string[]> {
    // Scan project files
    const files = await this.scanner.scan(root);

    // Build symbol index
    const indexedFiles = await this.indexer.index(root, files);

    const lowerQuery = query.toLowerCase();

    const matches = indexedFiles
      .filter((file) =>
        file.symbols.some((symbol) =>
          symbol.name.toLowerCase().includes(lowerQuery),
        ),
      )
      .map((file) => file.file);

    return [...new Set(matches)];
  }
}