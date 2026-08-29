import type { Request, Response, NextFunction } from "express";

import type { UploadedFile } from "../types/file.types.js";
import type { FileService } from "../services/file.service.js";
import { BadRequestError, UnauthorizedError } from "../errors/app.error.js";

export class FileController {
  constructor(private readonly fileService: FileService) {}

  private getStorageKey(req: Request): string {
    const { storageKey } = req.params;

    if (!storageKey || typeof storageKey !== "string" || !storageKey.trim()) {
      throw new BadRequestError("Invalid storage key");
    }

    return storageKey.trim();
  }

  upload = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("Authentication required.");
      }

      if (!req.file) {
        throw new BadRequestError("File is required");
      }

      const file: UploadedFile = {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      };

      const result = await this.fileService.processUpload(file, userId);

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
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("Authentication required.");
      }

      const file = await this.fileService.getFile(storageKey, userId);

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      );
      res.setHeader("Content-Length", file.size);
      res.status(200).send(file.buffer);
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
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("Authentication required.");
      }

      await this.fileService.deleteFile(storageKey, userId);

      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("Authentication required.");
      }

      const files = await this.fileService.getUserFiles(userId);

      res.status(200).json({
        success: true,
        files,
      });
    } catch (error) {
      next(error);
    }
  };

  getMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idOrKey = req.params.idOrKey || req.params.storageKey || req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("Authentication required.");
      }

      if (!idOrKey || typeof idOrKey !== "string" || !idOrKey.trim()) {
        throw new BadRequestError("File identifier is required");
      }

      const file = await this.fileService.getFileMetadata(idOrKey.trim(), userId);

      res.status(200).json({
        success: true,
        file,
      });
    } catch (error) {
      next(error);
    }
  };
}
