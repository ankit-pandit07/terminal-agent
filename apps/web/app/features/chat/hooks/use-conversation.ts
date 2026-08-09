"use client";

import { useEffect, useState } from "react";

import {
  getConversation,
  getConversations,
} from "../api/conversation.api";

import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";

export function useConversations() {
  const setConversations =
    useConversationStore(
      (s) => s.setConversations
    );

  const conversations =
    useConversationStore(
      (s) => s.conversations
    );

  const selectConversation =
    useConversationStore(
      (s) => s.selectConversation
    );

  const [loading, setLoading] =
    useState(true);

  const setMessages = useChatStore(
    (s) => s.setMessages
  );

  async function refresh() {
    try {
      const data = await getConversations();

      setConversations(data);
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(
    id: string
  ) {
    try {
      const conversation =
        await getConversation(id);

      selectConversation(
        conversation.id
      );

      setMessages(
        conversation.messages
      );
    } catch (error) {
      console.error(
        "Failed to open conversation:",
        error
      );
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