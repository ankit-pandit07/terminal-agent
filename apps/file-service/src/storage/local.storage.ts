import { mkdir, readFile, unlink, access, writeFile } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

import type {
  UploadedFile,
} from "../types/file.types.js";
import type {
  StorageResult,
  StorageService,
} from "./storage.interface.js";

export class LocalStorage implements StorageService {
  constructor(private readonly basePath: string) {}

  private resolvePath(storageKey: string): string {
    const resolvedPath = path.resolve(this.basePath, storageKey);
    const resolvedBasePath = path.resolve(this.basePath);

    if (
      resolvedPath !== resolvedBasePath &&
      !resolvedPath.startsWith(`${resolvedBasePath}${path.sep}`)
    ) {
      throw new Error("Invalid storage key");
    }

    return resolvedPath;
  }

  async upload(
    file: UploadedFile,
    storageKey: string,
  ): Promise<StorageResult> {
    const filePath = this.resolvePath(storageKey);

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });

    await writeFile(filePath, file.buffer);

    return {
      storageKey,
      size: file.size,
    };
  }

  async get(storageKey: string): Promise<Buffer> {
    const filePath = this.resolvePath(storageKey);

    return readFile(filePath);
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = this.resolvePath(storageKey);

    await unlink(filePath);
  }

  async exists(storageKey: string): Promise<boolean> {
    const filePath = this.resolvePath(storageKey);

    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}