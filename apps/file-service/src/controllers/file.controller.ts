import type { Request, Response, NextFunction } from "express";

import type { UploadedFile } from "../types/file.types.js";
import type { FileService } from "../services/file.service.js";

export class FileController {
  constructor(private readonly fileService: FileService) {}

  private getStorageKey(req: Request): string {
    const { storageKey } = req.params;

    if (typeof storageKey !== "string") {
      throw new Error("Invalid storage key");
    }

    return storageKey;
  }

  upload = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Get authenticated user
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "File is required",
        });
        return;
      }

      const file: UploadedFile = {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      };

      const result = await this.fileService.processUpload(
        file,
        userId,
      );

      res.status(201).json({
        success: true,
        file: result,
      });
    } catch (error) {
      next(error);
    }
  };

  download = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const storageKey = this.getStorageKey(req);

      const file = await this.fileService.getFile(storageKey);

      res.send(file);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const storageKey = this.getStorageKey(req);

      await this.fileService.deleteFile(storageKey);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}