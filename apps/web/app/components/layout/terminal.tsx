"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../features/chat/store/chat.store";

export function Terminal() {
  const [collapsed, setCollapsed] = useState(false);
  const events = useChatStore((s) => s.events);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom as events arrive
  useEffect(() => {
    if (!collapsed && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events, collapsed]);

  return (
    <div className="border-t border-zinc-800 bg-black font-mono text-xs text-zinc-300">
      {/* Terminal Bar Header */}
      <div className="flex h-8 items-center justify-between border-b border-zinc-800/60 bg-zinc-950 px-4 select-none">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
          <span className="font-semibold text-zinc-300 text-[11px] uppercase tracking-wider">
            Agent Output Console
          </span>
          <span className="text-zinc-600 text-[11px]">({events.length} events)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded px-2 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            {collapsed ? "▲ Expand" : "▼ Collapse"}
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      {!collapsed && (
        <div
          ref={logContainerRef}
          className="h-44 overflow-y-auto p-4 space-y-1.5 leading-relaxed selection:bg-zinc-800"
        >
          <div className="text-zinc-500">
            NodeBase Agent Console Initialized... Listening for execution events.
          </div>

          {events.map((event, i) => {
            const time = new Date().toLocaleTimeString();
            if (event.type === "tool-start") {
              return (
                <div key={i} className="text-yellow-400">
                  <span className="text-zinc-600">[{time}]</span> $ Executing tool:{" "}
                  <span className="font-semibold">{String(event.tool ?? "unknown")}</span>
                </div>
              );
            }
            if (event.type === "tool-complete") {
              return (
                <div key={i} className={event.success ? "text-emerald-400" : "text-red-400"}>
                  <span className="text-zinc-600">[{time}]</span> {event.success ? "✓" : "✕"}{" "}
                  Tool <span className="font-semibold">{String(event.tool)}</span> completed.
                </div>
              );
            }
            if (event.type === "recovery") {
              return (
                <div key={i} className="text-orange-400">
                  <span className="text-zinc-600">[{time}]</span> ↻ Recovery event:{" "}
                  {String(event.action)} — {String(event.reason)}
                </div>
              );
            }
            if (event.type === "error") {
              return (
                <div key={i} className="text-red-400 font-medium">
                  <span className="text-zinc-600">[{time}]</span> ERROR: {String(event.message)}
                </div>
              );
            }
            return (
              <div key={i} className="text-zinc-400">
                <span className="text-zinc-600">[{time}]</span> [{event.type}]{" "}
                {typeof event.message === "string"
                  ? event.message
                  : JSON.stringify(event.decision ?? event.response ?? "")}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}