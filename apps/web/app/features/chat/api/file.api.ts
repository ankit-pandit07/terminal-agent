import axios from "axios";
import { resolveFileServiceBaseUrl } from "@/lib/api";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/markdown",
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "txt",
  "md",
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadedFileDto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  parsed?: {
    text?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface UploadFileResponse {
  success: boolean;
  file: UploadedFileDto;
}

export function validateFileForUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: "Please select a file to upload." };
  }

  if (file.size === 0) {
    return { valid: false, error: "File cannot be empty (0 bytes)." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum allowed size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const isExtensionAllowed =
    extension &&
    ALLOWED_FILE_EXTENSIONS.includes(
      extension as (typeof ALLOWED_FILE_EXTENSIONS)[number],
    );

  const isMimeAllowed =
    file.type &&
    ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number]);

  if (!isExtensionAllowed && !isMimeAllowed) {
    return {
      valid: false,
      error: `Unsupported file type for "${file.name}". Supported: PDF, PNG, JPEG, WEBP, TXT, Markdown.`,
    };
  }

  return { valid: true };
}

export async function uploadFileToFileService(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadedFileDto> {
  const validation = validateFileForUpload(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = resolveFileServiceBaseUrl();

  const response = await axios.post<UploadFileResponse>(
    `${baseUrl}/files/upload`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    },
  );

  if (!response.data.success || !response.data.file) {
    throw new Error("File upload failed.");
  }

  return response.data.file;
}
