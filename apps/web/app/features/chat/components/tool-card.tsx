"use client";

import clsx from "clsx";
import type { Tool } from "../api/tools.api";

interface ToolCardProps {
  tool: Tool;
  onToggle: (name: string, enabled: boolean) => void;
}

export function ToolCard({ tool, onToggle }: ToolCardProps) {
  const { info } = tool;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xs transition hover:border-zinc-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              {info.displayName || tool.name}
            </h2>

            {info.category && (
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 font-medium">
                {info.category}
              </span>
            )}

            <span
              className={clsx(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                info.enabled
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20",
              )}
            >
              {info.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {info.description || tool.description}
          </p>

          <div className="mt-3 text-xs text-zinc-500">
            v{info.version || "1.0.0"} · Author: {info.author || "System"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(tool.name, info.enabled)}
          className={clsx(
            "shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition active:scale-95",
            info.enabled
              ? "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-md",
          )}
        >
          {info.enabled ? "Disable Tool" : "Enable Tool"}
        </button>
      </div>

      {info.capabilities && info.capabilities.length > 0 && (
        <div className="mt-4 border-t border-zinc-800/80 pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Capabilities
          </p>

          <div className="flex flex-wrap gap-1.5">
            {info.capabilities.map((capability) => (
              <span
                key={capability}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-mono text-zinc-300"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
