"use client";

import { useRouter } from "next/navigation";

import { useChatStore } from "../store/chat.store";
import { useConversationStore } from "../store/conversation.store";
import { getConversation } from "../api/conversation.api";
import { streamChat } from "../api/chat.stream";

export function useChat() {
  const router = useRouter();
  const loading = useChatStore((s) => s.loading);
  const setLoading = useChatStore((s) => s.setLoading);
  const conversationId = useChatStore((s) => s.conversationId);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const addEvent = useChatStore((s) => s.addEvent);
  const addConversation = useConversationStore((s) => s.addConversation);
  const selectConversation = useConversationStore((s) => s.selectConversation);

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

        async (event) => {
          addEvent(event);

          if (event.type !== "completed") {
            return;
          }

          addAssistantMessage(String(event.response ?? ""));
          const newConversationId = event.conversationId;
          if (typeof newConversationId !== "string") {
            return;
          }
          setConversationId(newConversationId);

          try {
            const conversation = await getConversation(newConversationId);
            addConversation(conversation);
            selectConversation(conversation.id);
          } catch (error) {
            console.error("Failed to load new conversation:", error);
          }

          router.push(`/chat?conversation=${newConversationId}`);
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
