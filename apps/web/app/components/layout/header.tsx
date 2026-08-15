"use client";

import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onToggleInspector?: () => void;
  inspectorOpen?: boolean;
}

const ROUTE_TITLES: Record<string, string> = {
  "/chat": "Chat Assistant",
  "/planner": "Task Planner",
  "/executions": "Execution History",
  "/memory": "Agent Memory",
  "/session": "Active Session",
  "/tools": "Tool Registry",
  "/workspace": "Workspace Info",
  "/settings": "Settings & Config",
};

export function Header({
  onToggleMobileSidebar,
  onToggleInspector,
  inspectorOpen = true,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Match current route title or fallback to route path
  const currentTitle =
    Object.entries(ROUTE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Terminal Agent";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden"
          title="Open menu"
        >
          ☰
        </button>

        <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Agent Ready</span>
        </div>

        {/* Inspector Toggle */}
        <button
          type="button"
          onClick={onToggleInspector}
          className={`
            hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:flex
            ${
              inspectorOpen
                ? "border-blue-600/50 bg-blue-600/10 text-blue-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
            }
          `}
          title="Toggle Event Inspector"
        >
          <span>🔍</span>
          <span>Inspector</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          Settings
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
          A
        </div>
      </div>
    </header>
  );
}

