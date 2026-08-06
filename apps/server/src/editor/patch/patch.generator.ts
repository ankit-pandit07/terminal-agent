import { DiffEngine } from "./diff.engine.js";
import type { Patch } from "./patch.types.js";

export class PatchGenerator {
  private diff = new DiffEngine();

  generate(oldContent: string, newContent: string): Patch {
    const operations = this.diff.generate(oldContent, newContent);

    return {
      operations,

      changed: operations.length > 0,
    };
  }
}
