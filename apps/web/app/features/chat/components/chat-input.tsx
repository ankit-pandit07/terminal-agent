"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useChat } from "../hooks/use-chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSuggestedPrompt?: (prompt: string) => void;
}

export function ChatInput({ onSuggestedPrompt }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { stream, loading } = useChat();

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

  async function submitMessage() {
    const message = value.trim();
    if (!message || loading) return;

    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await stream(message);
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
            "relative flex items-end gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-lg transition-all focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-blue-500/50",
            loading && "opacity-80",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              loading
                ? "Agent is processing your request..."
                : "Ask Terminal Agent to run commands, edit files, or analyze your project..."
            }
            rows={1}
            disabled={loading}
            className="max-h-40 min-h-[38px] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden disabled:cursor-not-allowed"
          />

          <Button
            type="submit"
            size="icon"
            disabled={loading || !value.trim()}
            className={cn(
              "h-8 w-8 shrink-0 rounded-xl transition-transform active:scale-95",
              value.trim() && !loading
                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                : "bg-zinc-800 text-zinc-500 hover:bg-zinc-800",
            )}
            title="Send message (Enter)"
            aria-label="Send message"
          >
            {loading ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span>Autonomous AI Terminal Control</span>
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