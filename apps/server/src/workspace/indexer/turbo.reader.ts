import fs from "fs/promises";
import path from "path";

import type { WorkspaceReader } from "./workspace-reader.js";
import type { TurboInfo } from "./turbo.types.js";

export class TurboReader
  implements WorkspaceReader<TurboInfo>
{
  async read(root: string): Promise<TurboInfo | null> {
    try {
      const file = path.join(root, "turbo.json");
      const text = await fs.readFile(file, "utf8");
      const json = JSON.parse(text);

      return {
        ui: json.ui,
        tasks: Object.keys(json.tasks ?? {}),
      };
    } catch {
      return null;
    }
  }
}