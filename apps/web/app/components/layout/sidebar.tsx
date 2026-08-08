import Link from "next/link";
import { ConversationList } from "../../features/chat/components/conversation-list";
import { useConversationStore } from "../../features/chat/store/conversation.store";
import { useChatStore } from "../../features/chat/store/chat.store";

export function Sidebar() {
  const clear =
  useChatStore((s) => s.clear);

const clearSelection =
  useConversationStore(
    (s) => s.clearSelection,
  );

<button
  onClick={() => {
    clear();
    clearSelection();
  }}
></button>
  return (
    <aside className="flex w-64 flex-col border-r bg-zinc-900 text-white">

      {/* Logo */}
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">NodeBase</h1>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button className="w-full rounded bg-blue-600 px-3 py-2">
          New Chat
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 px-4">
        <Link href="/chat">Chat</Link>
        <br />
        <Link href="/workspace">Workspace</Link>
        <br />
        <Link href="/memory">Memory</Link>
        <br />
        <Link href="/executions">Executions</Link>
      </nav>

      {/* Conversation History */}
      <div className="mt-6 flex-1 overflow-y-auto px-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-400">
          Conversations
        </h2>

        <ConversationList />
      </div>

    </aside>
  );
}