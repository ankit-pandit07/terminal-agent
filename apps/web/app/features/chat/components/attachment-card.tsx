"use client";

import React from "react";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  File as FileIcon,
  Download,
} from "lucide-react";
import { resolveFileServiceBaseUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ChatAttachment } from "../store/chat.store";

interface AttachmentCardProps {
  attachment: ChatAttachment;
  className?: string;
}

export function formatFileSize(bytes?: number): string {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileTypeInfo(mimeType?: string, name?: string) {
  const ext = name?.split(".").pop()?.toLowerCase() || "";

  if (mimeType === "application/pdf" || ext === "pdf") {
    return {
      label: "PDF",
      badgeClass: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: <FileText className="h-4 w-4 text-red-400 shrink-0" />,
    };
  }
  if (
    mimeType?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)
  ) {
    return {
      label: (ext || "IMG").toUpperCase(),
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: <ImageIcon className="h-4 w-4 text-blue-400 shrink-0" />,
    };
  }
  if (
    mimeType === "text/markdown" ||
    ext === "md" ||
    ["ts", "tsx", "js", "jsx", "json", "py", "rs", "go", "sql"].includes(ext)
  ) {
    return {
      label: (ext || "CODE").toUpperCase(),
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      icon: <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />,
    };
  }
  return {
    label: (ext || "DOC").toUpperCase(),
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: <FileIcon className="h-4 w-4 text-amber-400 shrink-0" />,
  };
}

export function AttachmentCard({ attachment, className }: AttachmentCardProps) {
  const fileInfo = getFileTypeInfo(attachment.mimeType, attachment.originalName);
  const sizeFormatted = formatFileSize(attachment.size);
  const fileKey = attachment.storageKey || attachment.fileId;
  const downloadUrl = `${resolveFileServiceBaseUrl()}/files/${encodeURIComponent(fileKey)}`;

  return (
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.originalName}
      className={cn(
        "group/card flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-left transition-all hover:border-white/20 hover:bg-black/40 active:scale-[0.99] max-w-full sm:max-w-md",
        className,
      )}
      title={`Download ${attachment.originalName || "file"}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* File Type Icon container */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 border border-zinc-700/50 shadow-inner">
          {fileInfo.icon}
        </div>

        {/* File Name & Sub-details */}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-xs text-zinc-100 group-hover/card:text-white transition-colors">
            {attachment.originalName || "Attached File"}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
            <span
              className={cn(
                "rounded px-1 py-0.2 font-mono font-semibold text-[9px] border",
                fileInfo.badgeClass,
              )}
            >
              {fileInfo.label}
            </span>
            {sizeFormatted && (
              <>
                <span>·</span>
                <span>{sizeFormatted}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Download Action Icon */}
      <div className="shrink-0 p-1 rounded-md text-zinc-400 group-hover/card:text-zinc-100 group-hover/card:bg-white/10 transition-all">
        <Download className="h-3.5 w-3.5" />
      </div>
    </a>
  );
}
