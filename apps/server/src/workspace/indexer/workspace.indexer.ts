import process from "process";

import { FileScanner } from "./file.scanner.js";
import { PackageReader } from "./package.reader.js";

export class WorkspaceIndexer {
  private scanner = new FileScanner();

  private packageReader = new PackageReader();

  async index() {
    const root = process.cwd();
    const files = await this.scanner.scan(root);
    const packageInfo = await this.packageReader.read(root);

    return {
      root,
      package: packageInfo,
      totalFiles: files.filter((f) => f.type === "file").length,
      totalDirectories: files.filter((f) => f.type === "directory").length,
      files,
    };
  }
}
