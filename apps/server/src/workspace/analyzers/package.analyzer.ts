import { promises as fs } from "fs";
import path from "path";

export interface PackageInfo {
  name?: string;

  dependencies: string[];
  devDependencies: string[];

  scripts: Record<string, string>;
}

export class PackageAnalyzer {
  async analyze(root: string): Promise<PackageInfo> {
    const packagePath = path.join(root, "package.json");

    try {
      const raw = await fs.readFile(packagePath, "utf8");
      const pkg = JSON.parse(raw);

      return {
        name: pkg.name,
        dependencies: Object.keys(pkg.dependencies ?? {}),
        devDependencies: Object.keys(pkg.devDependencies ?? {}),
        scripts: pkg.scripts ?? {},
      };
    } catch {
      return {
        dependencies: [],
        devDependencies: [],
        scripts: {},
      };
    }
  }
}