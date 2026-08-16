"use client";

import { useEffect, useRef, useState } from "react";
import {
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useChatStore } from "@/app/features/chat/store/chat.store";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Terminal() {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const events = useChatStore((s) => s.events);
  const loading = useChatStore((s) => s.loading);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom as events arrive
  useEffect(() => {
    if (!collapsed && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events, collapsed]);

  // Aggregate logs text for copying
  const allLogsText = events
    .map((event) => {
      const time = new Date().toLocaleTimeString();
      return `[${time}] [${event.type}] ${
        typeof event.message === "string"
          ? event.message
          : JSON.stringify(event)
      }`;
    })
    .join("\n");

  return (
    <div
      className={cn(
        "border-t border-zinc-800 bg-zinc-950/95 font-mono text-xs text-zinc-300 transition-all backdrop-blur-md",
        fullscreen
          ? "fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col"
          : "relative",
      )}
    >
      {/* Terminal Bar Header */}
      <div className="flex h-9 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-4 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                loading ? "bg-blue-400 animate-ping" : "bg-emerald-500/80 animate-pulse",
              )}
            />
            <TerminalIcon className="h-3.5 w-3.5 text-zinc-400" />
          </div>

          <span className="font-semibold text-zinc-200 text-[11px] uppercase tracking-wider">
            Agent Output Console
          </span>

          <span className="rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400 font-mono">
            {events.length} logs
          </span>
        </div>

        <div className="flex items-center gap-1">
          {events.length > 0 && (
            <CopyButton
              text={allLogsText}
              size="icon-sm"
              className="h-6 w-6 text-zinc-400"
            />
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setFullscreen(!fullscreen)}
              className="h-6 w-6 text-zinc-400 hover:text-white"
              title={fullscreen ? "Minimize console" : "Maximize console"}
            >
              {fullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (fullscreen) setFullscreen(false);
              setCollapsed(!collapsed);
            }}
            className="h-6 w-6 text-zinc-400 hover:text-white"
            title={collapsed ? "Expand console" : "Collapse console"}
          >
            {collapsed ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Terminal Content Body */}
      {!collapsed && (
        <div
          ref={logContainerRef}
          className={cn(
            "overflow-y-auto p-4 space-y-1.5 leading-relaxed selection:bg-zinc-800 font-mono text-[11.5px]",
            fullscreen ? "flex-1" : "h-44",
          )}
        >
          <div className="text-zinc-600 flex items-center gap-2 pb-1 border-b border-zinc-900">
            <span className="text-blue-500">❯</span> NodeBase Agent Console initialized. Listening for runtime events...
          </div>

          {events.length === 0 ? (
            <div className="text-zinc-600 italic py-2">
              Waiting for agent activity. Commands, tool outputs, and reflections will appear here.
            </div>
          ) : (
            events.map((event, i) => {
              const time = new Date().toLocaleTimeString();

              if (event.type === "tool-start") {
                return (
                  <div key={i} className="text-amber-400/90 flex items-start gap-1.5">
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="text-amber-500 shrink-0">$</span>
                    <span>
                      Executing tool:{" "}
                      <span className="font-semibold text-amber-300">
                        {String(event.tool ?? "unknown")}
                      </span>
                    </span>
                  </div>
                );
              }

              if (event.type === "tool-complete") {
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-1.5",
                      event.success ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="shrink-0">{event.success ? "✓" : "✕"}</span>
                    <span>
                      Tool{" "}
                      <span className="font-semibold">{String(event.tool)}</span>{" "}
                      {event.success ? "completed successfully." : "failed."}
                    </span>
                  </div>
                );
              }

              if (event.type === "recovery") {
                return (
                  <div key={i} className="text-orange-400 flex items-start gap-1.5">
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="shrink-0">↻</span>
                    <span>
                      Recovery [{String(event.action)}]:{" "}
                      <span className="text-zinc-300">{String(event.reason)}</span>
                    </span>
                  </div>
                );
              }

              if (event.type === "verification") {
                return (
                  <div key={i} className="text-purple-400 flex items-start gap-1.5">
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="shrink-0">🔍</span>
                    <span>
                      Verification: {JSON.stringify(event.verification ?? event.status ?? "")}
                    </span>
                  </div>
                );
              }

              if (event.type === "decision") {
                const dec = event.decision as Record<string, unknown> | undefined;
                return (
                  <div key={i} className="text-indigo-300 flex items-start gap-1.5">
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="shrink-0">🧠</span>
                    <span>
                      Decision [{String(dec?.decision ?? "step")}]:{" "}
                      <span className="text-zinc-300">{String(dec?.reason ?? "")}</span>
                    </span>
                  </div>
                );
              }

              if (event.type === "completed") {
                return (
                  <div key={i} className="text-emerald-400 font-semibold flex items-start gap-1.5">
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="shrink-0">✓</span>
                    <span>
                      Task Completed:{" "}
                      <span className="font-normal text-zinc-300">
                        {String(event.response ?? "Success")}
                      </span>
                    </span>
                  </div>
                );
              }

              if (event.type === "error") {
                return (
                  <div key={i} className="text-rose-400 font-medium flex items-start gap-1.5">
                    <span className="text-zinc-600 shrink-0">[{time}]</span>
                    <span className="shrink-0">⚠</span>
                    <span>ERROR: {String(event.message)}</span>
                  </div>
                );
              }

              return (
                <div key={i} className="text-zinc-400 flex items-start gap-1.5">
                  <span className="text-zinc-600 shrink-0">[{time}]</span>
                  <span className="text-blue-400 shrink-0">[{event.type}]</span>
                  <span>
                    {typeof event.message === "string"
                      ? event.message
                      : JSON.stringify(event.decision ?? event.response ?? "")}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}