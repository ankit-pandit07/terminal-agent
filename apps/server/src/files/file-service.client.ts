import { env } from "../config/env.js";

export interface FileMetadataDto {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  status: string;
  extractedText?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileResultDto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  parsed: {
    text?: string;
    metadata?: Record<string, unknown>;
  };
}

export class FileServiceClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || env.FILE_SERVICE_URL;
  }

  private buildHeaders(authToken?: string): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authToken) {
      headers["Authorization"] = authToken.startsWith("Bearer ")
        ? authToken
        : `Bearer ${authToken}`;
    }
    return headers;
  }

  async getFileMetadata(
    idOrKey: string,
    authToken: string,
  ): Promise<FileMetadataDto> {
    const response = await fetch(
      `${this.baseUrl}/files/meta/${encodeURIComponent(idOrKey)}`,
      {
        method: "GET",
        headers: this.buildHeaders(authToken),
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(data.message || `File Service error (${response.status})`);
    }

    const data = (await response.json()) as {
      success: boolean;
      file: FileMetadataDto;
    };
    return data.file;
  }

  async getUserFiles(authToken: string): Promise<FileMetadataDto[]> {
    const response = await fetch(`${this.baseUrl}/files`, {
      method: "GET",
      headers: this.buildHeaders(authToken),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(data.message || `File Service error (${response.status})`);
    }

    const data = (await response.json()) as {
      success: boolean;
      files: FileMetadataDto[];
    };
    return data.files;
  }

  async downloadFile(
    storageKey: string,
    authToken: string,
  ): Promise<{ buffer: Buffer; mimeType: string; originalName: string }> {
    const response = await fetch(
      `${this.baseUrl}/files/${encodeURIComponent(storageKey)}`,
      {
        method: "GET",
        headers: this.buildHeaders(authToken),
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(
        data.message || `File Service download error (${response.status})`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimeType =
      response.headers.get("content-type") || "application/octet-stream";
    const disposition = response.headers.get("content-disposition") || "";
    let originalName = storageKey;
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      originalName = decodeURIComponent(match[1]);
    }

    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType,
      originalName,
    };
  }

  async uploadFile(
    file: { buffer: Buffer; originalName: string; mimeType: string },
    authToken: string,
  ): Promise<UploadFileResultDto> {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimeType });
    formData.append("file", blob, file.originalName);

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(
        data.message || `File Service upload error (${response.status})`,
      );
    }

    const data = (await response.json()) as {
      success: boolean;
      file: UploadFileResultDto;
    };
    return data.file;
  }

  async deleteFile(storageKey: string, authToken: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/files/${encodeURIComponent(storageKey)}`,
      {
        method: "DELETE",
        headers: this.buildHeaders(authToken),
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(
        data.message || `File Service delete error (${response.status})`,
      );
    }
  }
}

export const fileServiceClient = new FileServiceClient();
