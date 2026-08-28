import type {
  ParsedFile,
  UploadedFile,
} from "../types/file.types.js";

import type { FileParser } from "./parser.interface.js";
import { ImageParser } from "./image.parser.js";
import { PdfParser } from "./pdf.parser.js";
import { TextParser } from "./text.parser.js";

export class ParserService {
  private readonly parsers: FileParser[];

  constructor() {
    this.parsers = [
      new PdfParser(),
      new ImageParser(),
      new TextParser(),
    ];
  }

  async parse(file: UploadedFile): Promise<ParsedFile> {
    const parser = this.parsers.find((item) =>
      item.supports(file.mimeType),
    );

    if (!parser) {
      throw new Error(`Unsupported file type: ${file.mimeType}`);
    }

    return parser.parse(file);
  }
}