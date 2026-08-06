import type { Patch, PatchResult } from "./patch.types.js";

export class PatchApplier {
  apply(original: string, patch: Patch): PatchResult {
    let content = original;

    for (const operation of patch.operations) {
      switch (operation.type) {
        case "replace":
          content =
            content.slice(0, operation.start) +
            operation.text +
            content.slice(operation.end);

          break;
      }
    }

    return {
      success: true,

      content,
    };
  }
}
