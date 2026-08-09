"use client";

import { ConversationList } from "../../features/chat/components/conversation-list";
import { useChatStore } from "../../features/chat/store/chat.store";
import { useConversationStore } from "../../features/chat/store/conversation.store";


export function Sidebar() {
  const clearChat = useChatStore((s) => s.clear);

  const clearSelection = useConversationStore((s) => s.clearSelection);

  function handleNewChat() {
    clearChat();
    clearSelection();
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-white">
      {/* Logo */}
      <div className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold">NodeBase</h1>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button
          type="button"
          onClick={handleNewChat}
          className="
            w-full
            rounded-lg
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-500
            active:scale-[0.98]
          "
        >
          + New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="mb-2 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Conversations
          </h2>
        </div>

        <ConversationList />
      </div>
    </aside>
  );
}
