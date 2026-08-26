"use client";

import { useCallback, useEffect } from "react";
import { getConversation, getConversations } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "@/app/features/auth/store/auth.store";

export function useConversations() {
  const conversations = useConversationStore((s) => s.conversations);
  const selectedConversationId = useConversationStore(
    (s) => s.selectedConversationId
  );
  const loading = useConversationStore((s) => s.loading);
  const error = useConversationStore((s) => s.error);
  const initialized = useConversationStore((s) => s.initialized);

  const setConversations = useConversationStore((s) => s.setConversations);
  const selectConversation = useConversationStore((s) => s.selectConversation);
  const setLoading = useConversationStore((s) => s.setLoading);
  const setError = useConversationStore((s) => s.setError);

  const setMessages = useChatStore((s) => s.setMessages);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const authenticated = useAuthStore((s) => s.authenticated);
  const authLoading = useAuthStore((s) => s.loading);

  const refresh = useCallback(async () => {
    // Only fetch if authenticated or auth check is finished
    if (authLoading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : "Failed to load recent conversations");
      console.error("Failed to load conversations:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [authLoading, setConversations, setLoading, setError]);

  const openConversation = useCallback(
    async (id: string) => {
      try {
        const conversation = await getConversation(id);
        selectConversation(conversation.id);
        setConversationId(conversation.id);

        // Normalize message roles (USER/user -> "user", ASSISTANT/assistant -> "assistant")
        const normalizedMessages = (conversation.messages || []).map((m) => ({
          id: m.id,
          role: (m.role?.toLowerCase() === "user" ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: m.content,
        }));

        setMessages(normalizedMessages);
        return conversation;
      } catch (err) {
        console.error("Failed to open conversation:", err);
        throw err;
      }
    },
    [selectConversation, setConversationId, setMessages]
  );

  // Auto fetch conversations when authenticated
  useEffect(() => {
    if (authenticated && !initialized) {
      void refresh();
    }
  }, [authenticated, initialized, refresh]);

  return {
    conversations,
    selectedConversationId,
    loading,
    error,
    refresh,
    openConversation,
  };
}