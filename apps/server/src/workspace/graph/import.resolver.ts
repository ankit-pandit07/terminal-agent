import path from "path";

import type { ProjectFile } from "../indexer/file.scanner.js";

export class ImportResolver {

  resolve(
    importer: string,
    imported: string,
    files: ProjectFile[],
  ): string | null {

    if (!imported.startsWith(".")) {
      return imported;
    }

    const importerDir = path.dirname(importer);

    const absolute = path.normalize(
      path.join(importerDir, imported),
    );

    const candidates = [
      absolute,
      `${absolute}.ts`,
      `${absolute}.tsx`,
      `${absolute}.js`,
      `${absolute}.jsx`,
      path.join(absolute, "index.ts"),
      path.join(absolute, "index.tsx"),
      path.join(absolute, "index.js"),
    ];

    for (const candidate of candidates) {
      const file = files.find((f) => f.path === candidate);

      if (file) {
        return file.path;
      }
    }

    return imported;
  }

}