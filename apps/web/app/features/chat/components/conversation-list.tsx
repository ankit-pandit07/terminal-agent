"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquareDashed,
  Search,
  X,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useConversations } from "../hooks/use-conversation";
import { deleteConversation } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";
import { ConversationItem } from "./conversation-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConversationListProps {
  onSelect?: () => void;
}

export function ConversationList({ onSelect }: ConversationListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, selectedConversationId, loading, error, refresh, openConversation } =
    useConversations();

  const selectConversation = useConversationStore((s) => s.selectConversation);
  const removeConversation = useConversationStore((s) => s.removeConversation);
  const clearSelection = useConversationStore((s) => s.clearSelection);
  const clearChat = useChatStore((s) => s.clear);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.title || "Untitled Conversation").toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  async function handleSelect(id: string) {
    selectConversation(id);
    router.push(`/chat?conversation=${id}`);
    onSelect?.();
    try {
      await openConversation(id);
    } catch (err) {
      console.error("Failed to load selected conversation:", err);
    }
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
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  }

  // 1. Loading Skeleton (Prevents flickering and "No conversations" flash)
  if (loading && conversations.length === 0) {
    return (
      <div className="space-y-2 px-1 py-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 rounded-lg border border-zinc-900 bg-zinc-950/40 p-2.5"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-xs bg-zinc-800" />
              <Skeleton
                className="h-3.5 rounded-xs bg-zinc-800"
                style={{ width: `${60 + (i % 3) * 15}%` }}
              />
            </div>
            <Skeleton className="h-2.5 w-16 rounded-xs bg-zinc-900 ml-5.5" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-900/30 bg-red-950/10 p-4 text-center my-2">
        <AlertCircle className="h-4 w-4 text-red-400 mb-1.5" />
        <p className="text-xs font-medium text-red-300">Unable to load chats</p>
        <p className="text-[10px] text-zinc-500 mt-0.5 max-w-[180px] truncate">
          {error}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          className="mt-2.5 h-6 px-2 text-[11px] border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white gap-1"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  // 3. Empty State
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800/80 mb-2">
          <MessageSquareDashed className="h-4 w-4 text-zinc-500" />
        </div>
        <p className="text-xs text-zinc-400 font-medium">No conversations yet</p>
        <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
          Ask a question or run a command to start
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Search Bar (Only shown when there are conversations) */}
      <div className="relative px-0.5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search history..."
          className="h-7.5 pl-8 pr-7 text-xs bg-zinc-900/80 border-zinc-800/80 placeholder:text-zinc-500 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500"
          aria-label="Search conversation history"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-zinc-500 hover:text-zinc-300 rounded-xs cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* No Search Matches State */}
      {filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
          <Search className="h-4 w-4 text-zinc-600 mb-1.5" />
          <p className="text-xs text-zinc-400 font-medium">No results found</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            No chats matching &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-[11px] text-blue-400 hover:underline cursor-pointer font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        /* Conversation Items List */
        <div className="space-y-1">
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              id={conversation.id}
              title={conversation.title}
              timestamp={conversation.updatedAt || conversation.createdAt}
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
