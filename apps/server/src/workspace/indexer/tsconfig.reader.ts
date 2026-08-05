import fs from "fs/promises";
import path from "path";

import type { WorkspaceReader } from "./workspace-reader.js";
import type { TsConfigInfo } from "./tsconfig.types.js";

export class TsConfigReader
  implements WorkspaceReader<TsConfigInfo>
{
  async read(root: string): Promise<TsConfigInfo | null> {
    try {
      const file = path.join(root, "tsconfig.json");
      const text = await fs.readFile(file, "utf8");
      const json = JSON.parse(text);
      const compiler = json.compilerOptions ?? {};

      return {
        baseUrl: compiler.baseUrl,
        rootDir: compiler.rootDir,
        outDir: compiler.outDir,
        module: compiler.module,
        target: compiler.target,
        jsx: compiler.jsx,
        strict: compiler.strict ?? false,
        paths: compiler.paths ?? {},
      };
    } catch {
      return null;
    }
  }
}