"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Sparkles,
  Square,
  Paperclip,
  X,
  FileText,
  FileCode,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useChat } from "../hooks/use-chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  uploadFileToFileService,
  validateFileForUpload,
} from "../api/file.api";

interface ChatInputProps {
  onSuggestedPrompt?: (prompt: string) => void;
}

interface AttachedFileState {
  tempId: string;
  fileId?: string;
  name: string;
  size: number;
  mimeType: string;
  status: "uploading" | "ready" | "error";
  progress?: number;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string, name: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
  }
  if (name.endsWith(".md") || mimeType === "text/markdown") {
    return <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
  }
  return <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
}

export function ChatInput({ onSuggestedPrompt }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<AttachedFileState[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { stream, stop, loading } = useChat();

  const isUploading = attachments.some((a) => a.status === "uploading");

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180,
      )}px`;
    }
  }, [value]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    // Reset file input value so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    for (const file of fileList) {
      const tempId = crypto.randomUUID();
      const validation = validateFileForUpload(file);

      if (!validation.valid) {
        setAttachments((prev) => [
          ...prev,
          {
            tempId,
            name: file.name,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
            status: "error",
            error: validation.error,
          },
        ]);
        continue;
      }

      // Add to attachments in uploading state
      setAttachments((prev) => [
        ...prev,
        {
          tempId,
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          status: "uploading",
          progress: 0,
        },
      ]);

      // Execute upload in background
      void (async () => {
        try {
          const result = await uploadFileToFileService(file, (progress) => {
            setAttachments((prev) =>
              prev.map((a) => (a.tempId === tempId ? { ...a, progress } : a)),
            );
          });

          setAttachments((prev) =>
            prev.map((a) =>
              a.tempId === tempId
                ? {
                    ...a,
                    status: "ready",
                    fileId: result.id,
                    progress: 100,
                  }
                : a,
            ),
          );
        } catch (err: unknown) {
          const errMsg =
            err instanceof Error ? err.message : "Upload failed.";
          setAttachments((prev) =>
            prev.map((a) =>
              a.tempId === tempId
                ? {
                    ...a,
                    status: "error",
                    error: errMsg,
                  }
                : a,
            ),
          );
        }
      })();
    }
  }

  function removeAttachment(tempId: string) {
    setAttachments((prev) => prev.filter((a) => a.tempId !== tempId));
  }

  async function submitMessage() {
    const message = value.trim();
    if (!message || loading || isUploading) return;

    const readyFileIds = attachments
      .filter((a) => a.status === "ready" && a.fileId)
      .map((a) => a.fileId as string);

    setValue("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await stream(
        message,
        readyFileIds.length > 0 ? readyFileIds : undefined,
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setValue(message);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitMessage();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submitMessage();
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur-md">
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl">
        <div
          className={cn(
            "relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-lg transition-all focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-blue-500/50",
            loading && "opacity-90 border-blue-500/30",
          )}
        >
          {/* Attachment Badges / Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2 border-b border-zinc-800/80 mb-2">
              {attachments.map((att) => (
                <div
                  key={att.tempId}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all max-w-[280px]",
                    att.status === "ready" &&
                      "bg-zinc-800/90 border border-zinc-700/70 text-zinc-200",
                    att.status === "uploading" &&
                      "bg-blue-950/40 border border-blue-800/50 text-blue-300",
                    att.status === "error" &&
                      "bg-red-950/40 border border-red-800/60 text-red-300",
                  )}
                >
                  {att.status === "uploading" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400 shrink-0" />
                  ) : att.status === "error" ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  ) : (
                    getFileIcon(att.mimeType, att.name)
                  )}

                  <span
                    className="truncate font-medium"
                    title={att.error || `${att.name} (${formatFileSize(att.size)})`}
                  >
                    {att.name}
                  </span>

                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {att.status === "uploading"
                      ? `${att.progress || 0}%`
                      : att.status === "error"
                        ? "Failed"
                        : formatFileSize(att.size)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeAttachment(att.tempId)}
                    className="ml-1 rounded p-0.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors cursor-pointer"
                    title="Remove attachment"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown"
              className="hidden"
              aria-label="Upload files"
            />

            {/* Attachment Trigger Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={loading || isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 shrink-0 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Attach files (PDF, images, TXT, Markdown up to 10MB)"
              aria-label="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                loading
                  ? "Agent is thinking and executing tools..."
                  : isUploading
                    ? "Uploading attached files..."
                    : "Ask Terminal Agent to run commands, edit files, or analyze your project..."
              }
              rows={1}
              disabled={loading}
              className="max-h-40 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden disabled:cursor-not-allowed"
            />

            {loading ? (
              <Button
                type="button"
                size="icon"
                onClick={stop}
                className="h-8 w-8 shrink-0 rounded-xl bg-red-600/90 text-white hover:bg-red-500 shadow-md shadow-red-500/20 transition-transform active:scale-95 cursor-pointer"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!value.trim() || isUploading}
                className={cn(
                  "h-8 w-8 shrink-0 rounded-xl transition-transform active:scale-95 cursor-pointer",
                  value.trim() && !isUploading
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-800 cursor-not-allowed",
                )}
                title={
                  isUploading
                    ? "Uploading attachments..."
                    : "Send message (Enter)"
                }
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span>
              {loading
                ? "Streaming response · Click Stop to cancel"
                : isUploading
                  ? "Uploading attached documents/images..."
                  : "Autonomous AI Terminal Control · Attach files (PDF, images, TXT, MD up to 10MB)"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-zinc-600">
            <span>Press</span>
            <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
              Enter
            </kbd>
            <span>to send ·</span>
            <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
              Shift + Enter
            </kbd>
            <span>new line</span>
          </div>
        </div>
      </form>
    </div>
  );
}