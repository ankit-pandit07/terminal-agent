"use client";

import { useState } from "react";
import { useChat } from "../hooks/use-chat";

export function ChatInput() {
  const [value, setValue] = useState("");

  const { stream, loading } = useChat();

  async function submitMessage() {
    const message = value.trim();

    if (!message || loading) return;

    setValue("");

    try {
      await stream(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      setValue(message);
    }
  }

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    await submitMessage();
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      void submitMessage();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-zinc-800 bg-zinc-950 px-4 py-4"
    >
      <div className="mx-auto max-w-4xl">
        <div
          className="
            flex items-end gap-3
            rounded-2xl
            border border-zinc-700
            bg-zinc-900
            px-4 py-3
            shadow-lg
            focus-within:border-zinc-500
          "
        >
          <button
            type="button"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              text-xl text-zinc-400
              hover:bg-zinc-800
              hover:text-white
            "
          >
            +
          </button>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Terminal Agent..."
            rows={1}
            disabled={loading}
            className="
              max-h-40
              min-h-9
              flex-1
              resize-none
              bg-transparent
              py-2
              text-sm
              leading-5
              text-zinc-100
              outline-none
              placeholder:text-zinc-500
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="
              flex h-9 min-w-9
              shrink-0
              items-center justify-center
              rounded-lg
              bg-blue-600
              px-3
              text-sm font-medium
              text-white
              hover:bg-blue-500
              disabled:cursor-not-allowed
              disabled:bg-zinc-700
              disabled:text-zinc-500
            "
          >
            {loading ? "..." : "↑"}
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-zinc-600">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </form>
  );
}