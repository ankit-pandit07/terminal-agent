import type { ErrorRequestHandler } from "express";
import multer from "multer";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: "File is too large",
      });
      return;
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        error: "Only one file is allowed",
      });
      return;
    }

    res.status(400).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      error: error.message,
    });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
  });
};