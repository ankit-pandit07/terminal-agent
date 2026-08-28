import type {
  ParsedFile,
  UploadedFile,
} from "../types/file.types.js";

import type { FileParser } from "./parser.interface.js";

export class ImageParser implements FileParser {
  private readonly supportedMimeTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
  ]);

  supports(mimeType: string): boolean {
    return this.supportedMimeTypes.has(mimeType);
  }

  async parse(file: UploadedFile): Promise<ParsedFile> {
    return {
      metadata: {
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        type: "image",
      },
    };
  }
}