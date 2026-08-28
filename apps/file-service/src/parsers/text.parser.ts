import { UploadedFile, ParsedFile } from "../types/file.types.js";
import { FileParser } from "./parser.interface.js";

export class TextParser implements FileParser {
    private readonly supportMineTypes=new Set([
        "text/plain",
        "text/markdown",
    ])

    supports(mimeType: string): boolean {
        return this.supportMineTypes.has(mimeType)
    }

    async parse(file: UploadedFile): Promise<ParsedFile> {
        return {
            text:file.buffer.toString("utf-8"),
            metadata:{
                originalName:file.originalName,
                mimeType:file.mimeType,
                size:file.size
            }
        }
    }
}