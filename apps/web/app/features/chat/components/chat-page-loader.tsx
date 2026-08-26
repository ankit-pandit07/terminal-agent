"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { getConversation } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";

export function ChatPageLoader() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const currentChatConvId = useChatStore((s) => s.conversationId);
  const setMessages = useChatStore((s) => s.setMessages);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const selectConversation = useConversationStore(
    (s) => s.selectConversation,
  );
  const addConversation = useConversationStore(
    (s) => s.addConversation,
  );
  
  const clearChat = useChatStore((s) => s.clear);

  useEffect(() => {
    if (!conversationId) {
      if (currentChatConvId) {
        clearChat();
      }
      return;
    }

    if (currentChatConvId === conversationId) {
      return;
    }

    const id = conversationId;

    async function loadConversation() {
      try {
        const conversation = await getConversation(id);
        setConversationId(conversation.id);
        
        const normalized = (conversation.messages || []).map((m) => ({
          id: m.id,
          role: (m.role?.toLowerCase() === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        }));

        setMessages(normalized);
        selectConversation(conversation.id);
        addConversation(conversation);
      } catch (error) {
        console.error("Failed to load conversation:", error);
      }
    }

    void loadConversation();
  }, [
    conversationId,
    currentChatConvId,
    setMessages,
    setConversationId,
    selectConversation,
    addConversation,
    clearChat,
  ]);

  return null;
}
