import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../errors/app.error.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: "File exceeds the maximum allowed size.",
      });
      return;
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        success: false,
        message: "Only one file is allowed per upload.",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message || "Invalid file upload.",
    });
    return;
  }

  // Log unhandled server errors internally
  console.error("Unhandled error in file-service:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};