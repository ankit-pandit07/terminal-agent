import multer from "multer";
import { env } from "../config/env.js";

const maxFileSize = env.MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});