import process from "process";

import { FileScanner } from "./file.scanner.js";
import { PackageReader } from "./package.reader.js";
import { TsConfigReader } from "./tsconfig.reader.js";
import { TurboReader } from "./turbo.reader.js";
import { PrismaReader } from "./prisma.reader.js";

export class WorkspaceIndexer {
  private scanner = new FileScanner();

  private packageReader = new PackageReader();
  private tsConfigReader = new TsConfigReader();

  private turboReader = new TurboReader();

  private prismaReader = new PrismaReader();

  async index() {
    const root = process.cwd();
    const files = await this.scanner.scan(root);
    const packageInfo = await this.packageReader.read(root);

    const tsconfig = await this.tsConfigReader.read(root);

    const turbo = await this.turboReader.read(root);

    const prisma = await this.prismaReader.read(root);

    
    return {
      root,
      package: packageInfo,
      totalFiles: files.filter((f) => f.type === "file").length,
      totalDirectories: files.filter((f) => f.type === "directory").length,
      tsconfig,
      turbo,
      prisma,
      files,
    };
  }
}
