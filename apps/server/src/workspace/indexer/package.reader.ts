import type { PackageInfo } from "./package.types.js";
import type { WorkspaceReader } from "./workspace-reader.js";
import fs from "fs/promises";
import path from "path";

export class PackageReader implements WorkspaceReader<PackageInfo> {
  async read(root: string): Promise<PackageInfo | null> {
    try {
      const file = path.join(root, "package.json");
      const text = await fs.readFile(file, "utf-8");

      const json = JSON.parse(text);

      return {
        name: json.name,
        version: json.version,
        private: json.private,
        type: json.type,
        packageManager: json.packageManager,
        scripts: json.scripts,
        dependencies: Object.keys(json.dependencies ?? {}),
        devDependencies: Object.keys(json.devDependencies ?? {}),
        peerDependencies: Object.keys(json.peerDependencies ?? {}),
        optionalDependencies: Object.keys(json.optionalDependencies ?? {}),
      };
    } catch {
      return null;
    }
  }
}
