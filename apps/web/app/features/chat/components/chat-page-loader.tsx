"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getConversation } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";

export function ChatPageLoader() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const lastLoadedIdRef = useRef<string | null>(null);

  const setMessages = useChatStore((s) => s.setMessages);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const clearChat = useChatStore((s) => s.clear);

  const selectConversation = useConversationStore((s) => s.selectConversation);
  const addConversation = useConversationStore((s) => s.addConversation);
  const clearSelection = useConversationStore((s) => s.clearSelection);

  useEffect(() => {
    // Case 1: Active conversation in URL
    if (conversationId) {
      if (lastLoadedIdRef.current === conversationId) {
        return;
      }
      lastLoadedIdRef.current = conversationId;

      // Only fetch from API if the chat store isn't already pointing to this conversation
      if (useChatStore.getState().conversationId !== conversationId) {
        const id = conversationId;
        async function loadConversation() {
          try {
            const conversation = await getConversation(id);
            if (conversation && conversation.id === id) {
              setConversationId(conversation.id);

              const normalized = (conversation.messages || []).map((m) => ({
                id: m.id,
                role: (m.role?.toLowerCase() === "user" ? "user" : "assistant") as
                  | "user"
                  | "assistant",
                content: m.content,
                attachments: m.attachments,
              }));

              setMessages(normalized);
              selectConversation(conversation.id);
              addConversation(conversation);
            }
          } catch (error) {
            console.error("Failed to load conversation:", error);
          }
        }

        void loadConversation();
      } else {
        selectConversation(conversationId);
      }
      return;
    }

    // Case 2: User transitioned from a conversation to /chat (e.g. New Chat clicked)
    if (!conversationId && lastLoadedIdRef.current !== null) {
      lastLoadedIdRef.current = null;
      clearChat();
      clearSelection();
    }
  }, [
    conversationId,
    setMessages,
    setConversationId,
    selectConversation,
    addConversation,
    clearChat,
    clearSelection,
  ]);

  return null;
}
