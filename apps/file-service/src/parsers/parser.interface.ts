import { ParsedFile, UploadedFile } from "../types/file.types.js";

export interface FileParser{
    supports(mimeType:string):boolean;

    parse(file:UploadedFile):Promise<ParsedFile>
}