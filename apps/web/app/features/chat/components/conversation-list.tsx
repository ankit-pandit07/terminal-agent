"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareDashed, Search, X } from "lucide-react";
import { useConversations } from "../hooks/use-conversation";
import { deleteConversation } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";
import { ConversationItem } from "./conversation-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface ConversationListProps {
  onSelect?: () => void;
}

export function ConversationList({ onSelect }: ConversationListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.title || "Untitled Conversation").toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

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
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative px-0.5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chats..."
          className="h-7 pl-8 pr-7 text-xs bg-zinc-900/80 border-zinc-800/80 placeholder:text-zinc-500 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500"
          aria-label="Search conversation history"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-zinc-500 hover:text-zinc-300 rounded-xs cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Filtered List or No Matches Empty State */}
      {filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-5 px-2 text-center">
          <Search className="h-4 w-4 text-zinc-600 mb-1.5" />
          <p className="text-xs text-zinc-400 font-medium">No conversations found</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            No chats matching &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-[11px] text-blue-400 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-0.5">
          {filteredConversations.map((conversation) => (
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
      )}
    </div>
  );
}

