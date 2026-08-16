"use client";

import { useState } from "react";
import { Brain, Search, Key } from "lucide-react";
import { useMemory } from "../hooks/use-memory";
import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Props {
  conversationId?: string;
}

export function MemoryPanel({ conversationId }: Props) {
  const { memory, loading, error, refresh } = useMemory(conversationId);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  if (loading) {
    return <ListSkeleton count={4} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load memory"
        error={error}
        onRetry={() => void refresh()}
      />
    );
  }

  if (memory.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No memories recorded"
        description="Agent memories, task outputs, and learned context from conversations will be indexed here."
      />
    );
  }

  const memoryTypes = Array.from(new Set(memory.map((m) => m.type)));

  const filtered = memory.filter((item) => {
    if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.key.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search keys, values, or types..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-zinc-950/80 border-zinc-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
              typeFilter === "ALL"
                ? "bg-zinc-800 text-white font-semibold shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            All Types ({memory.length})
          </button>
          {memoryTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer font-mono ${
                typeFilter === t
                  ? "bg-zinc-800 text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
          No memory entries match your search criteria.
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((item) => (
            <MemoryCard key={item.id} memory={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({
  memory,
}: {
  memory: {
    id: string;
    type: string;
    key: string;
    value: string;
    createdAt: string;
  };
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70 shadow-md transition hover:border-zinc-700">
      <CardHeader className="p-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Badge variant="default" className="bg-zinc-800 font-mono text-[10px] uppercase">
              {memory.type}
            </Badge>

            <div className="flex items-center gap-1.5 min-w-0">
              <Key className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="font-mono text-xs font-semibold text-white truncate">
                {memory.key}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">
              {new Date(memory.createdAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <CopyButton text={memory.value} size="icon-sm" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3">
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-950 p-3 font-mono text-[11.5px] leading-relaxed text-zinc-300 border border-zinc-800/80 selection:bg-zinc-800">
          {memory.value}
        </pre>
      </CardContent>
    </Card>
  );
}
