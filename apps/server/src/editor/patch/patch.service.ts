import { PatchApplier } from "./patch.applier.js";
import { PatchGenerator } from "./patch.generator.js";
import type { PatchResult } from "./patch.types.js";
import { PatchValidator } from "./patch.validator.js";

export class PatchService {
  private generator = new PatchGenerator();
  private validator = new PatchValidator();
  private applier = new PatchApplier();

  apply(oldContent: string, newContent: string): PatchResult {
    const patch = this.generator.generate(oldContent, newContent);

    if (!this.validator.validate(patch)) {
      return {
        success: false,

        content: oldContent,
      };
    }

    return this.applier.apply(oldContent, patch);
  }
}
