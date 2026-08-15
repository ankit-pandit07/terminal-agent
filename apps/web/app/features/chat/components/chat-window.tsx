"use client";

import { useChatStore } from "../store/chat.store";
import { EventList } from "./event-list";
import { MessageList } from "./message-list";
import { useEffect, useRef, useState } from "react";
import { confirmAction, cancelAction } from "../api/chat.api";

export function ChatWindow() {
  const messages = useChatStore((s) => s.messages);
  const events = useChatStore((s) => s.events);

  const confirmationId = useChatStore((s) => s.confirmationId);
  const confirmationMessage = useChatStore((s) => s.confirmationMessage);
  const clearConfirmation = useChatStore((s) => s.clearConfirmation);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const [processing, setProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, events]);

  async function handleConfirm() {
    if (!confirmationId || processing) {
      return;
    }

    try {
      setProcessing(true);
      const result = await confirmAction(confirmationId);
      clearConfirmation();
      addAssistantMessage(
        String(result.response ?? "Action completed successfully."),
      );
    } catch (error) {
      console.error("Confirmation failed:", error);

      addAssistantMessage("Failed to confirm the action.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancel() {
    if (!confirmationId || processing) {
      return;
    }

    try {
      setProcessing(true);
      const result = await cancelAction(confirmationId);
      clearConfirmation();

      addAssistantMessage(String(result.response ?? "Action cancelled."));
    } catch (error) {
      console.error("Cancellation failed:", error);

      addAssistantMessage("Failed to cancel the action.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto px-6 py-8">
      <EventList />

      <MessageList />

      {/* Confirmation Panel */}
      {confirmationId && confirmationMessage && (
        <div className="mt-4 mb-4 rounded-2xl border border-yellow-700/50 bg-zinc-900 p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>

            <h3 className="text-base font-semibold text-yellow-400">
              Confirmation Required
            </h3>
          </div>

          <p className="mb-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {confirmationMessage}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={processing}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing..." : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
