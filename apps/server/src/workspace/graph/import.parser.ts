import fs from "fs/promises";

export class ImportParser {
  async parse(file: string): Promise<string[]> {
    try {
      const source = await fs.readFile(file, "utf8");

      const imports = [
        ...source.matchAll(
          /import\s+(?:[\s\S]*?)from\s+["'](.+?)["']/g,
        ),
      ];

      return imports
        .map((m) => m[1])
        .filter(
          (value): value is string => value !== undefined,
        );
    } catch {
      return [];
    }
  }
}