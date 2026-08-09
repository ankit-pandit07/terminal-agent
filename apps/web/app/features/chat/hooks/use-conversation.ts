"use client";

import { useEffect, useState } from "react";

import { getConversation, getConversations } from "../api/conversation.api";

import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";

export function useConversations() {
  const conversations = useConversationStore((s) => s.conversations);
  const setConversations = useConversationStore((s) => s.setConversations);
  const selectConversation = useConversationStore((s) => s.selectConversation);
  const setMessages = useChatStore((s) => s.setMessages);

  const clearChat = useChatStore((s) => s.clear);

  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      setLoading(true);

      const data = await getConversations();

      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(id: string) {
    try {
      selectConversation(id);

      clearChat();

      const conversation = await getConversation(id);

      setMessages(conversation.messages ?? []);
    } catch (error) {
      console.error("Failed to open conversation:", error);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return {
    conversations,
    loading,
    refresh,
    openConversation,
  };
}
