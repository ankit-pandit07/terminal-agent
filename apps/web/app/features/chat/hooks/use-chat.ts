"use client";

import { useChatStore } from "../store/chat.store";
import { streamChat } from "../api/chat.stream";

export function useChat() {
  const loading = useChatStore((s) => s.loading);
  const setLoading = useChatStore((s) => s.setLoading);
  const conversationId = useChatStore((s) => s.conversationId);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const addEvent = useChatStore((s) => s.addEvent);

  async function stream(message: string) {
    if (loading) return;
    setLoading(true);
    addUserMessage(message);

    try {
      await streamChat(
        {
          message,
          ...(conversationId ? { conversationId } : {}),
        },

        (event) => {
          addEvent(event);
          if (event.type === "completed") {
            addAssistantMessage(String(event.response ?? ""));
          }
        },
      );
    } catch (error) {
      console.error("Chat stream failed:", error);

      addAssistantMessage(
        "Sorry, something went wrong while processing your request.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    stream,
  };
}
