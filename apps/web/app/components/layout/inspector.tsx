"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  X,
  Search,
  Activity,
  Trash2,
} from "lucide-react";
import { useChatStore } from "@/app/features/chat/store/chat.store";
import { JsonViewer } from "@/components/shared/json-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InspectorProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Inspector({ isOpen, onToggle }: InspectorProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const events = useChatStore((s) => s.events);
  const loading = useChatStore((s) => s.loading);

  const filteredEvents = events.filter((e) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const typeStr = String(e.type ?? "").toLowerCase();
    const jsonStr = JSON.stringify(e).toLowerCase();
    return typeStr.includes(q) || jsonStr.includes(q);
  });

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-80 sm:w-96 flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-all duration-200 ease-in-out md:static shrink-0">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Telemetry Inspector
            </h2>
            <p className="text-[10px] text-zinc-500">Live SSE Stream Frames</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge
            variant={loading ? "default" : "outline"}
            className={cn(
              "text-[10px] font-mono gap-1",
              loading
                ? "bg-blue-600/20 text-blue-300 border-blue-500/30 animate-pulse"
                : "bg-zinc-900 border-zinc-800 text-zinc-400"
            )}
          >
            {loading && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />}
            <span>{events.length} frames</span>
          </Badge>

          {events.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => useChatStore.getState().clearEvents()}
              className="h-6 px-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              title="Clear telemetry frames"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span>Clear</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="text-zinc-400 hover:text-white"
            aria-label="Close inspector"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter search bar */}
      <div className="border-b border-zinc-800/80 p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Filter event payload or type..."
            value={filterQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterQuery(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs bg-zinc-900/80 border-zinc-800 placeholder:text-zinc-500"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Frame list */}
      <ScrollArea className="flex-1 p-3">
        {events.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Activity}
              title="No telemetry frames yet"
              description="Interact with the agent or run a planner task to inspect real-time SSE stream payloads."
            />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-zinc-500">
              No frames match &quot;{filterQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="mt-2 text-[11px] text-blue-400 hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((evt, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3 shadow-xs transition hover:border-zinc-700"
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span className="font-mono text-xs font-semibold text-zinc-200">
                      {String(evt.type ?? "event")}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">
                    #{idx + 1}
                  </span>
                </div>

                <JsonViewer
                  data={evt}
                  title="Event Payload"
                  initialExpanded={true}
                  maxHeight="max-h-48"
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
