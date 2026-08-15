"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConversationList } from "../../features/chat/components/conversation-list";
import { useChatStore } from "../../features/chat/store/chat.store";
import { useConversationStore } from "../../features/chat/store/conversation.store";

const NAV_ITEMS = [
  { label: "Chat", path: "/chat", icon: "💬" },
  { label: "Planner", path: "/planner", icon: "📋" },
  { label: "Executions", path: "/executions", icon: "⚡" },
  { label: "Memory", path: "/memory", icon: "🧠" },
  { label: "Session", path: "/session", icon: "⏱️" },
  { label: "Tools", path: "/tools", icon: "🛠️" },
  { label: "Workspace", path: "/workspace", icon: "📁" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clearChat = useChatStore((s) => s.clear);
  const clearSelection = useConversationStore((s) => s.clearSelection);

  function handleNewChat() {
    clearChat();
    clearSelection();
    router.push("/chat");
    onCloseMobile?.();
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-white transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md">
              N
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">NodeBase</h1>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
            >
              ✕
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="
              flex w-full items-center justify-center gap-2
              rounded-xl
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-md
              transition
              hover:bg-blue-500
              active:scale-[0.98]
            "
          >
            <span>+</span>
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="border-b border-zinc-800 px-3 py-2">
          <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Navigation
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onCloseMobile}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-zinc-800/80 text-white shadow-xs"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Conversations History */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-2 px-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Conversations
            </h2>
          </div>
          <ConversationList />
        </div>
      </aside>
    </>
  );
}

