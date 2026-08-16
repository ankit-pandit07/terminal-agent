"use client";

import { useState } from "react";
import { Wrench, Search } from "lucide-react";
import { useTools } from "../hooks/use-tools";
import { ToolCard } from "./tool-card";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";

export function ToolsPanel() {
  const { tools, loading, error, refresh, toggleTool } = useTools();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  if (loading) {
    return <CardGridSkeleton count={6} />;
  }

  if (error && tools.length === 0) {
    return (
      <ErrorState
        title="Failed to load tool registry"
        error={error}
        onRetry={() => void refresh()}
      />
    );
  }

  if (tools.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No tools registered"
        description="Agent tools configured on the backend will appear here."
      />
    );
  }

  const categories = Array.from(
    new Set(tools.map((t) => t.info.category).filter(Boolean)),
  );

  const filtered = tools.filter((tool) => {
    if (categoryFilter !== "ALL" && tool.info.category !== categoryFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tool.name.toLowerCase().includes(q) ||
        (tool.info.displayName || "").toLowerCase().includes(q) ||
        (tool.description || "").toLowerCase().includes(q) ||
        (tool.info.category || "").toLowerCase().includes(q) ||
        (tool.info.capabilities || []).some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search and Category Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search tools and capabilities..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-zinc-950/80 border-zinc-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
              categoryFilter === "ALL"
                ? "bg-zinc-800 text-white font-semibold shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            All Categories ({tools.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-zinc-800 text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
          No tools match "{search}".
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              onToggle={(name, enabled) => void toggleTool(name, enabled)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
