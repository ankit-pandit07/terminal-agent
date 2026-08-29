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

// Enforce authentication across all file endpoints
router.use(requireAuth);

router.post(
  "/upload",
  uploadMiddleware.single("file"),
  fileController.upload,
);

router.get("/", fileController.list);

router.get(
  "/meta/:idOrKey",
  fileController.getMetadata,
);

router.get(
  "/:idOrKey/meta",
  fileController.getMetadata,
);

router.get(
  "/:storageKey",
  fileController.download,
);

router.delete(
  "/:storageKey",
  fileController.delete,
);

export default router;