import fs from "fs/promises";

import type { SymbolInfo } from "./symbol.types.js";

export class SymbolParser {
  async parse(file: string): Promise<SymbolInfo[]> {
    try {
      const source = await fs.readFile(file, "utf8");

      const symbols: SymbolInfo[] = [];

      // Classes
      this.extract(
        source,
        /export\s+(?:default\s+)?class\s+(\w+)/g,
        "class",
        true,
        symbols,
      );

      this.extract(
        source,
        /(?<!export\s)(?:abstract\s+)?class\s+(\w+)/g,
        "class",
        false,
        symbols,
      );

      // Interfaces
      this.extract(
        source,
        /export\s+interface\s+(\w+)/g,
        "interface",
        true,
        symbols,
      );

      this.extract(
        source,
        /(?<!export\s)interface\s+(\w+)/g,
        "interface",
        false,
        symbols,
      );

      // Enums
      this.extract(
        source,
        /export\s+enum\s+(\w+)/g,
        "enum",
        true,
        symbols,
      );

      this.extract(
        source,
        /(?<!export\s)enum\s+(\w+)/g,
        "enum",
        false,
        symbols,
      );

      // Type aliases
      this.extract(
        source,
        /export\s+type\s+(\w+)/g,
        "type",
        true,
        symbols,
      );

      this.extract(
        source,
        /(?<!export\s)type\s+(\w+)/g,
        "type",
        false,
        symbols,
      );

      // Functions
      this.extract(
        source,
        /export\s+(?:async\s+)?function\s+(\w+)/g,
        "function",
        true,
        symbols,
      );

      this.extract(
        source,
        /(?<!export\s)(?:async\s+)?function\s+(\w+)/g,
        "function",
        false,
        symbols,
      );

      // Variables
      this.extract(
        source,
        /export\s+(?:const|let|var)\s+(\w+)/g,
        "variable",
        true,
        symbols,
      );

      this.extract(
        source,
        /(?<!export\s)(?:const|let|var)\s+(\w+)/g,
        "variable",
        false,
        symbols,
      );

      // Remove duplicates
      const unique = new Map<string, SymbolInfo>();

      for (const symbol of symbols) {
        const key = `${symbol.kind}:${symbol.name}`;

        const existing = unique.get(key);

        // Prefer exported version
        if (!existing || (!existing.exported && symbol.exported)) {
          unique.set(key, symbol);
        }
      }

      return [...unique.values()];
    } catch {
      return [];
    }
  }

  private extract(
    source: string,
    regex: RegExp,
    kind: SymbolInfo["kind"],
    exported: boolean,
    result: SymbolInfo[],
  ) {
    for (const match of source.matchAll(regex)) {
      const name = match[1];

      if (!name) continue;

      result.push({
        name,
        kind,
        exported,
      });
    }
  }
}