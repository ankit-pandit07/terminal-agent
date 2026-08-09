"use client";

import { useChatStore } from "../../features/chat/store/chat.store";


export function Inspector() {
  const events = useChatStore((s) => s.events);

  return (
    <aside className="flex w-80 flex-col border-l border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="font-semibold text-white">Inspector</h2>
      </div>

      <div className="border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-center">
            <p className="text-sm text-zinc-500">No events yet</p>

            <p className="mt-1 text-xs text-zinc-600">
              Events will appear here when the agent runs.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event, index) => (
              <div
                key={`${event.type}-${index}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">
                    {event.type}
                  </span>

                  <span className="text-xs text-zinc-600">#{index + 1}</span>
                </div>

                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-zinc-500">
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
