"use client";

import clsx from "clsx";
import { useTools } from "../hooks/use-tools";

export function ToolsPanel() {
  const { tools, loading, error, refresh, toggleTool } = useTools();

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        Loading tools...
      </div>
    );
  }

  if (error && tools.length === 0) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
        <p className="text-sm text-red-400">{error}</p>

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {tools.map((tool) => (
        <div
          key={tool.name}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  {tool.info.displayName}
                </h2>

                <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                  {tool.info.category}
                </span>

                <span
                  className={clsx(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    tool.info.enabled
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400",
                  )}
                >
                  {tool.info.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-400">
                {tool.info.description}
              </p>

              <div className="mt-3 text-xs text-zinc-600">
                v{tool.info.version} · {tool.info.author}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void toggleTool(tool.name, tool.info.enabled)}
              className={clsx(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition",
                tool.info.enabled
                  ? "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  : "bg-blue-600 text-white hover:bg-blue-500",
              )}
            >
              {tool.info.enabled ? "Disable" : "Enable"}
            </button>
          </div>

          {tool.info.capabilities.length > 0 && (
            <div className="mt-5 border-t border-zinc-800 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Capabilities
              </p>

              <div className="flex flex-wrap gap-2">
                {tool.info.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
