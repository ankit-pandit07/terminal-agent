import { randomUUID } from "node:crypto";
import path from "node:path";

import { ALLOWED_MIME_TYPES } from "../types/file.types.js";
import type { ParsedFile, UploadedFile } from "../types/file.types.js";
import type { StorageService } from "../storage/storage.interface.js";
import { ParserService } from "../parsers/parser.service.js";
import { FileRepository } from "../repositories/file.repository.js";
import {
  BadRequestError,
  NotFoundError,
  UnsupportedMediaTypeError,
} from "../errors/app.error.js";

export interface ProcessedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  parsed: ParsedFile;
}

export interface FileDownloadResult {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

export class FileService {
  constructor(
    private readonly storage: StorageService,
    private readonly parserService: ParserService,
    private readonly fileRepository: FileRepository,
  ) {}

  async processUpload(
    file: UploadedFile,
    userId: string,
  ): Promise<ProcessedFile> {
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
        userId,
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
      // Clean up physical file if parsing or database creation fails
      await this.storage.delete(storageKey).catch((cleanupErr) => {
        console.error(
          `Failed to clean up physical storage for key ${storageKey}:`,
          cleanupErr,
        );
      });

      throw error;
    }
  }

  async getFile(
    storageKey: string,
    userId: string,
  ): Promise<FileDownloadResult> {
    const file = await this.fileRepository.findByStorageKeyAndUser(
      storageKey,
      userId,
    );

    if (!file) {
      throw new NotFoundError("File not found");
    }

    const exists = await this.storage.exists(storageKey);

    if (!exists) {
      throw new NotFoundError("File not found");
    }

    const buffer = await this.storage.get(storageKey);

    return {
      buffer,
      mimeType: file.mimeType,
      originalName: file.originalName,
      size: file.size,
    };
  }

  async deleteFile(storageKey: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findByStorageKeyAndUser(
      storageKey,
      userId,
    );

    if (!file) {
      throw new NotFoundError("File not found");
    }

    const exists = await this.storage.exists(storageKey);

    if (exists) {
      await this.storage.delete(storageKey);
    }

    try {
      const result = await this.fileRepository.deleteByStorageKeyAndUser(
        storageKey,
        userId,
      );

      if (result.count === 0) {
        throw new NotFoundError("File not found");
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      console.error(
        `Database deletion failed for storageKey ${storageKey} after physical removal:`,
        error,
      );
      throw error;
    }
  }

  async getUserFiles(userId: string) {
    return this.fileRepository.findByUserId(userId);
  }

  private validateFile(file: UploadedFile): void {
    if (
      !file.originalName ||
      typeof file.originalName !== "string" ||
      !file.originalName.trim()
    ) {
      throw new BadRequestError("File name is required");
    }

    if (file.size <= 0 || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestError("File cannot be empty");
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimeType as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new UnsupportedMediaTypeError(
        `Unsupported file type: ${file.mimeType}`,
      );
    }
  }
}
