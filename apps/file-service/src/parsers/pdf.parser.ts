import { PDFParse } from "pdf-parse";

import type {
  ParsedFile,
  UploadedFile,
} from "../types/file.types.js";

import type { FileParser } from "./parser.interface.js";

export class PdfParser implements FileParser {
  supports(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  async parse(file: UploadedFile): Promise<ParsedFile> {
    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const result = await parser.getText();

      return {
        text: result.text,
        metadata: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        },
      };
    } finally {
      await parser.destroy();
    }
  }
}