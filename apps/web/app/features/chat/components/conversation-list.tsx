"use client";

import { useRouter } from "next/navigation";
import { MessageSquareDashed } from "lucide-react";
import { useConversations } from "../hooks/use-conversation";
import { deleteConversation } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";
import { ConversationItem } from "./conversation-item";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationListProps {
  onSelect?: () => void;
}

export function ConversationList({ onSelect }: ConversationListProps) {
  const router = useRouter();
  const { loading, openConversation } = useConversations();

  const conversations = useConversationStore((s) => s.conversations);
  const selectedConversationId = useConversationStore(
    (s) => s.selectedConversationId,
  );
  const selectConversation = useConversationStore(
    (s) => s.selectConversation,
  );
  const removeConversation = useConversationStore((s) => s.removeConversation);
  const clearSelection = useConversationStore((s) => s.clearSelection);
  const clearChat = useChatStore((s) => s.clear);

  async function handleSelect(id: string) {
    selectConversation(id);
    router.push(`/chat?conversation=${id}`);
    onSelect?.();
    await openConversation(id);
  }

  async function handleDelete(id: string) {
    try {
      await deleteConversation(id);
      removeConversation(id);

      if (selectedConversationId === id) {
        clearSelection();
        clearChat();
        router.push("/chat");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-1.5 px-1 py-1">
        <Skeleton className="h-7 w-full rounded-md" />
        <Skeleton className="h-7 w-full rounded-md" />
        <Skeleton className="h-7 w-3/4 rounded-md" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
        <MessageSquareDashed className="h-5 w-5 text-zinc-600 mb-1.5" />
        <p className="text-xs text-zinc-500 font-medium">No conversations yet</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">Start chatting to record history</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          id={conversation.id}
          title={conversation.title}
          active={selectedConversationId === conversation.id}
          onClick={() => {
            void handleSelect(conversation.id);
          }}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
