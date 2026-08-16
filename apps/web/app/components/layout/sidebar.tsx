"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  ListTodo,
  Zap,
  Brain,
  Gauge,
  Wrench,
  FolderTree,
  Settings,
  Plus,
  Bot,
  PanelLeftClose,
  Sparkles,
} from "lucide-react";
import { ConversationList } from "@/app/features/chat/components/conversation-list";
import { useChatStore } from "@/app/features/chat/store/chat.store";
import { useConversationStore } from "@/app/features/chat/store/conversation.store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Chat", path: "/chat", icon: MessageSquare },
  { label: "Planner", path: "/planner", icon: ListTodo },
  { label: "Executions", path: "/executions", icon: Zap },
  { label: "Memory", path: "/memory", icon: Brain },
  { label: "Session", path: "/session", icon: Gauge },
  { label: "Tools", path: "/tools", icon: Wrench },
  { label: "Workspace", path: "/workspace", icon: FolderTree },
  { label: "Settings", path: "/settings", icon: Settings },
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

  const sidebarContent = (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      {/* Brand Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 px-4">
        <Link
          href="/chat"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          onClick={onCloseMobile}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">
                NodeBase
              </span>
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Agent
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-none">AI Terminal Control</p>
          </div>
        </Link>

        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCloseMobile}
            className="md:hidden text-zinc-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-sm font-medium"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-1">
        <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Agent Dashboard
        </p>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/chat"
                ? pathname === "/chat" || pathname === "/"
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors select-none",
                  isActive
                    ? "bg-zinc-800/90 text-white font-semibold shadow-xs border border-zinc-700/50"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-zinc-500",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-zinc-800/80" />

      {/* Conversation History Section */}
      <div className="flex flex-1 flex-col overflow-hidden px-3">
        <div className="mb-1.5 flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Recent Chats
          </span>
          <Sparkles className="h-3 w-3 text-zinc-600" />
        </div>

        <ScrollArea className="flex-1 pr-1">
          <ConversationList onSelect={onCloseMobile} />
        </ScrollArea>
      </div>

      {/* Bottom Footer / Status */}
      <div className="border-t border-zinc-800/80 p-3">
        <Link
          href="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-2 text-xs transition hover:bg-zinc-800/80 hover:border-zinc-700"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <Settings className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-200">System Preferences</p>
            <p className="text-[10px] text-zinc-500">v1.0.0 · Localhost</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Desktop & Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 ease-in-out md:static md:translate-x-0 shrink-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
