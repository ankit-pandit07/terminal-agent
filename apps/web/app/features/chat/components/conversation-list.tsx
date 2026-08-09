"use client";

import { useConversations } from "../hooks/use-conversation";
import {
  deleteConversation,
} from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";
import { ConversationItem } from "./conversation-item";

export function ConversationList() {
  const {
    loading,
    openConversation,
  } = useConversations();

  const conversations = useConversationStore(
    (s) => s.conversations
  );

  const selectedConversationId =
    useConversationStore(
      (s) => s.selectedConversationId
    );

  const removeConversation =
    useConversationStore(
      (s) => s.removeConversation
    );

  const clearSelection =
    useConversationStore(
      (s) => s.clearSelection
    );

  const clearChat = useChatStore(
    (s) => s.clear
  );

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      await deleteConversation(id);

      removeConversation(id);

      if (selectedConversationId === id) {
        clearSelection();
        clearChat();
      }
    } catch (error) {
      console.error(
        "Failed to delete conversation:",
        error
      );
    }
  }

  if (loading) {
    return (
      <div className="px-2 py-2 text-sm text-zinc-500">
        Loading conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-2 py-2 text-sm text-zinc-500">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          id={conversation.id}
          title={conversation.title}
          active={
            selectedConversationId ===
            conversation.id
          }
          onClick={() => {
            void openConversation(
              conversation.id
            );
          }}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}