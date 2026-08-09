"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { getConversation } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";

export function ChatPageLoader() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const setMessages = useChatStore((s) => s.setMessages);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const selectConversation = useConversationStore(
    (s) => s.selectConversation,
  );
  
  const clearChat = useChatStore((s) => s.clear);

  useEffect(() => {
    if (!conversationId) {
      clearChat();
      return;
    }

    const id = conversationId;

    async function loadConversation() {
      try {
        const conversation = await getConversation(id);
        setConversationId(conversation.id);
        setMessages(conversation.messages);
        selectConversation(conversation.id);
      } catch (error) {
        console.error("Failed to load conversation:", error);
      }
    }

    void loadConversation();
  }, [
    conversationId,
    setMessages,
    setConversationId,
    selectConversation,
    clearChat,
  ]);

  return null;
}
