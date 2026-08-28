export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/markdown",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export type FileStatus =
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export interface FileMetadata {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface ParsedFile {
  text?: string;
  metadata?: Record<string, unknown>;
}