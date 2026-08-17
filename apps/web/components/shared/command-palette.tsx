"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  SlidersHorizontal,
  Search,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useConversationStore } from "@/app/features/chat/store/conversation.store";
import { useChatStore } from "@/app/features/chat/store/chat.store";
import { useConversations } from "@/app/features/chat/hooks/use-conversation";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "Conversations";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleInspector?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onToggleInspector,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const conversations = useConversationStore((s) => s.conversations);
  const selectConversation = useConversationStore((s) => s.selectConversation);
  const clearSelection = useConversationStore((s) => s.clearSelection);
  const clearChat = useChatStore((s) => s.clear);
  const { openConversation } = useConversations();

  // Reset query and selection when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Build command items
  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Actions
      {
        id: "action-new-chat",
        category: "Actions",
        title: "New Chat Session",
        subtitle: "Start a fresh agent session",
        icon: Plus,
        shortcut: "N",
        action: () => {
          clearChat();
          clearSelection();
          router.push("/chat");
        },
      },
      {
        id: "action-toggle-inspector",
        category: "Actions",
        title: "Toggle Telemetry Inspector",
        subtitle: "View real-time event telemetry stream",
        icon: SlidersHorizontal,
        shortcut: "I",
        action: () => {
          onToggleInspector?.();
        },
      },

      // Navigation
      {
        id: "nav-chat",
        category: "Navigation",
        title: "Chat Console",
        subtitle: "Agent conversation & terminal prompts",
        icon: MessageSquare,
        shortcut: "G C",
        action: () => router.push("/chat"),
      },
      {
        id: "nav-planner",
        category: "Navigation",
        title: "Task Planner",
        subtitle: "Autonomous multi-step planner",
        icon: ListTodo,
        shortcut: "G P",
        action: () => router.push("/planner"),
      },
      {
        id: "nav-executions",
        category: "Navigation",
        title: "Execution Traces",
        subtitle: "Tool executions, parameters & logs",
        icon: Zap,
        shortcut: "G E",
        action: () => router.push("/executions"),
      },
      {
        id: "nav-memory",
        category: "Navigation",
        title: "Agent Memory",
        subtitle: "Short & long-term memory key-values",
        icon: Brain,
        shortcut: "G M",
        action: () => router.push("/memory"),
      },
      {
        id: "nav-session",
        category: "Navigation",
        title: "Session State",
        subtitle: "Working directory, modified files & history",
        icon: Gauge,
        shortcut: "G S",
        action: () => router.push("/session"),
      },
      {
        id: "nav-tools",
        category: "Navigation",
        title: "Tool Registry",
        subtitle: "Inspect & toggle registered agent tools",
        icon: Wrench,
        shortcut: "G T",
        action: () => router.push("/tools"),
      },
      {
        id: "nav-workspace",
        category: "Navigation",
        title: "Workspace Environment",
        subtitle: "Project stack, scripts & dependencies",
        icon: FolderTree,
        shortcut: "G W",
        action: () => router.push("/workspace"),
      },
      {
        id: "nav-settings",
        category: "Navigation",
        title: "System Settings",
        subtitle: "Connection health & UI preferences",
        icon: Settings,
        action: () => router.push("/settings"),
      },
    ];

    // Recent Conversations
    conversations.forEach((conv) => {
      items.push({
        id: `conv-${conv.id}`,
        category: "Conversations",
        title: conv.title || "Untitled Conversation",
        subtitle: "Open past chat history",
        icon: MessageSquare,
        action: async () => {
          selectConversation(conv.id);
          router.push(`/chat?conversation=${conv.id}`);
          await openConversation(conv.id);
        },
      });
    });

    return items;
  }, [
    clearChat,
    clearSelection,
    conversations,
    onToggleInspector,
    openConversation,
    router,
    selectConversation,
  ]);

  // Filter items by query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q),
    );
  }, [allItems, query]);

  // Keyboard navigation inside list
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onOpenChange(false);
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Group filtered items by category
  const categories = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-zinc-800 bg-zinc-950/95 text-zinc-100 shadow-2xl backdrop-blur-xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Quick search navigation and commands
        </DialogDescription>

        {/* Search Input Bar */}
        <div className="flex items-center border-b border-zinc-800 px-3.5 py-3">
          <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search conversation history..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Command Items List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 space-y-3 focus:outline-hidden"
        >
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands or conversations found.
            </div>
          ) : (
            Object.entries(categories).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {category}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const itemGlobalIndex = filteredItems.indexOf(item);
                    const isSelected = itemGlobalIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        data-index={itemGlobalIndex}
                        onClick={() => {
                          item.action();
                          onOpenChange(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition cursor-pointer select-none",
                          isSelected
                            ? "bg-blue-600/20 text-white border border-blue-500/30"
                            : "text-zinc-300 hover:bg-zinc-900",
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                              isSelected
                                ? "border-blue-500/40 bg-blue-500/20 text-blue-300"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-100">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="truncate text-[10px] text-zinc-500">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.shortcut && (
                            <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                              {item.shortcut}
                            </span>
                          )}
                          {isSelected && (
                            <ArrowRight className="h-3 w-3 text-blue-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-3.5 py-2 text-[11px] text-zinc-500 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.2 font-mono text-[10px] text-zinc-400">
                ↑↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.2 font-mono text-[10px] text-zinc-400">
                ↵
              </kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.2 font-mono text-[10px] text-zinc-400">
                esc
              </kbd>
              <span>close</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-zinc-600">
            <Terminal className="h-3 w-3" />
            <span>Terminal Agent Control</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
