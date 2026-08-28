import { Router } from "express";

import { FileController } from "../controllers/file.controller.js";
import { FileService } from "../services/file.service.js";
import { LocalStorage } from "../storage/local.storage.js";
import { ParserService } from "../parsers/parser.service.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

const storage = new LocalStorage("./storage");
const parserService = new ParserService();
const fileService = new FileService(storage, parserService);
const fileController = new FileController(fileService);

router.post(
  "/upload",
  uploadMiddleware.single("file"),
  fileController.upload,
);

router.get("/:storageKey", fileController.download);

router.delete("/:storageKey", fileController.delete);

export default router;
