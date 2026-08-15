"use client";

import { useTools } from "../hooks/use-tools";
import { ToolCard } from "./tool-card";

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

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-sm text-zinc-500">No agent tools registered.</p>
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
        <ToolCard
          key={tool.name}
          tool={tool}
          onToggle={(name, enabled) => void toggleTool(name, enabled)}
        />
      ))}
    </div>
  );
}

