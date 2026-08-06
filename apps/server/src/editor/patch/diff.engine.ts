import type { PatchOperation } from "./patch.types.js";

export class DiffEngine {
  generate(
    oldContent: string,
    newContent: string,
  ): PatchOperation[] {

    if (oldContent === newContent) {
      return [];
    }

    return [
      {
        type: "replace",
        start: 0,
        end: oldContent.length,
        text: newContent,
      },
    ];

  }
}