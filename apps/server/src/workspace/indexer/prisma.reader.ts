import fs from "fs/promises";
import path from "path";

import type { WorkspaceReader } from "./workspace-reader.js";
import type { PrismaInfo } from "./prisma.types.js";

export class PrismaReader implements WorkspaceReader<PrismaInfo> {
  async read(root: string): Promise<PrismaInfo | null> {
    try {
      const schema = await fs.readFile(
        path.join(root, "prisma", "schema.prisma"),
        "utf8",
      );
      const models = [...schema.matchAll(/^model\s+(\w+)/gm)]
        .map((match) => match[1])
        .filter((model): model is string => model !== undefined);
      const provider = schema.match(/provider\s*=\s*"([^"]+)"/)?.[1];

      return {
        hasPrisma: true,
        provider,
        datasource: "default",
        models,
      };
    } catch {
      return {
        hasPrisma: false,
        models: [],
      };
    }
  }
}
