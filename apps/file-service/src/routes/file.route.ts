import { Router } from "express";

import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { FileController } from "../controllers/file.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { ParserService } from "../parsers/parser.service.js";
import { FileRepository } from "../repositories/file.repository.js";
import { FileService } from "../services/file.service.js";
import { LocalStorage } from "../storage/local.storage.js";

const router = Router();

const storage = new LocalStorage(env.STORAGE_PATH);
const parserService = new ParserService();
const fileRepository = new FileRepository();

const fileService = new FileService(
  storage,
  parserService,
  fileRepository,
);

const fileController = new FileController(fileService);

router.post(
  "/upload",
  requireAuth,
  uploadMiddleware.single("file"),
  fileController.upload,
);
router.get("/",requireAuth,fileController.list)

router.get(
  "/:storageKey",
  requireAuth,
  fileController.download,
);

router.delete(
  "/:storageKey",
  requireAuth,
  fileController.delete,
);

export default router;