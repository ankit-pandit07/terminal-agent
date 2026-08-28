import { randomUUID } from "node:crypto";
import path from "node:path";

import { ALLOWED_MIME_TYPES } from "../types/file.types.js";
import type { ParsedFile, UploadedFile } from "../types/file.types.js";
import type { StorageService } from "../storage/storage.interface.js";
import { ParserService } from "../parsers/parser.service.js";
import { FileRepository } from "../repositories/file.repository.js";

export interface ProcessedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  parsed: ParsedFile;
}

export class FileService {
  constructor(
    private readonly storage: StorageService,
    private readonly parserService: ParserService,
    private readonly fileRepository: FileRepository,
  ) {}

  async processUpload(file: UploadedFile): Promise<ProcessedFile> {
    this.validateFile(file);

    const id = randomUUID();
    const extension = path.extname(file.originalName).toLowerCase();

    const storageKey = `${id}${extension}`;

    await this.storage.upload(file, storageKey);

    try {
      const parsed = await this.parserService.parse(file);

      const extractedText =
        typeof parsed.text === "string" ? parsed.text : undefined;

      const databaseFile = await this.fileRepository.create({
        userId: "system",
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        storageKey,
        status: "READY",
        extractedText,
      });

      return {
        id: databaseFile.id,
        originalName: databaseFile.originalName,
        mimeType: databaseFile.mimeType,
        size: databaseFile.size,
        storageKey: databaseFile.storageKey,
        parsed,
      };
    } catch (error) {
      await this.storage.delete(storageKey).catch(() => undefined);

      throw error;
    }
  }

  async getFile(storageKey: string): Promise<Buffer> {
    const exists = await this.storage.exists(storageKey);

    if (!exists) {
      throw new Error("File not found");
    }

    return this.storage.get(storageKey);
  }

  async deleteFile(storageKey: string): Promise<void> {
    const exists = await this.storage.exists(storageKey);

    if (!exists) {
      throw new Error("File not found");
    }

    await this.storage.delete(storageKey);
  }

  private validateFile(file: UploadedFile): void {
    if (!file.originalName.trim()) {
      throw new Error("File name is required");
    }

    if (file.size <= 0) {
      throw new Error("File cannot be empty");
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimeType as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new Error(`Unsupported file type: ${file.mimeType}`);
    }
  }
}
