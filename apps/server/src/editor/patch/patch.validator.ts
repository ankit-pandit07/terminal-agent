import type { Patch } from "./patch.types.js";

export class PatchValidator {
  validate(patch: Patch): boolean {
    return patch.operations.length > 0;
  }
}
