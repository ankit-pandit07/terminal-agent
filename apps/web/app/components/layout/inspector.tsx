"use client";

import { useChatStore } from "../../features/chat/store/chat.store";

interface InspectorProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Inspector({ isOpen = true, onToggle }: InspectorProps) {
  const events = useChatStore((s) => s.events);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950 transition-all duration-200">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔍</span>
          <h2 className="font-semibold text-white">Event Inspector</h2>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            title="Close Inspector"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 bg-zinc-900/30">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Stream Events
        </span>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          {events.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
            <p className="text-sm font-medium text-zinc-400">No events captured</p>
            <p className="mt-1.5 text-xs text-zinc-600">
              Raw stream payloads will appear here during execution.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {events.map((event, index) => (
              <div
                key={`${event.type}-${index}`}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900/90 p-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-blue-400">
                    {event.type}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-600">#{index + 1}</span>
                </div>

                <pre className="mt-2.5 max-h-48 overflow-auto rounded-md bg-zinc-950 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-400">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

