"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  SlidersHorizontal,
  Settings,
  Bot,
  Circle,
  Folder,
  Search,
} from "lucide-react";
import { useChatStore } from "@/app/features/chat/store/chat.store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleInspector: () => void;
  inspectorOpen: boolean;
  onOpenCommandPalette?: () => void;
}

const ROUTE_NAMES: Record<string, string> = {
  "/chat": "Chat Console",
  "/planner": "Task Planner",
  "/executions": "Execution Traces",
  "/memory": "Agent Memory",
  "/session": "Session State",
  "/tools": "Tool Registry",
  "/workspace": "Workspace Environment",
  "/settings": "Settings",
};

export function Header({
  onToggleMobileSidebar,
  onToggleInspector,
  inspectorOpen,
  onOpenCommandPalette,
}: HeaderProps) {
  const pathname = usePathname();
  const loading = useChatStore((s) => s.loading);

  const matchedRoute = Object.keys(ROUTE_NAMES).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const currentTitle = matchedRoute ? ROUTE_NAMES[matchedRoute] : "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-md">
      {/* Left section: mobile hamburger & breadcrumb title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleMobileSidebar}
          className="md:hidden text-zinc-400 hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">NodeBase</span>
          <span className="text-xs text-zinc-600">/</span>
          <h1 className="text-xs font-bold text-white tracking-wide">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right section: Command Palette trigger, live status pill, inspector toggle, settings & avatar */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        {onOpenCommandPalette && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 h-8 px-2.5 text-xs text-zinc-400 bg-zinc-900/60 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 select-none cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Commands</span>
            <kbd className="pointer-events-none ml-1 inline-flex h-4 select-none items-center gap-0.5 rounded border border-zinc-800 bg-zinc-950 px-1 font-mono text-[10px] text-zinc-400">
              <span>Ctrl</span>K
            </kbd>
          </Button>
        )}

        {/* Agent live status indicator */}
        <div
          className={cn(
            "hidden sm:flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
            loading
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              loading ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse",
            )}
          />
          <span>{loading ? "Agent Active" : "Agent Ready"}</span>
        </div>

        {/* Inspector Panel Toggle Button */}
        <Button
          variant={inspectorOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleInspector}
          className={cn(
            "gap-1.5 text-xs transition-colors",
            inspectorOpen
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-white",
          )}
          title="Toggle telemetry inspector"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Inspector</span>
        </Button>

        {/* Settings shortcut link */}
        <Button
          variant="ghost"
          size="icon-sm"
          asChild
          className="text-zinc-400 hover:text-white"
        >
          <Link href="/settings" title="Settings" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>

        {/* User avatar */}
        <Avatar className="h-7 w-7 border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-xs">
          <AvatarFallback className="bg-zinc-800 text-[11px] font-bold text-blue-400">
            AG
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

