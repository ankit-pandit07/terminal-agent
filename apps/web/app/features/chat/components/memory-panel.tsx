"use client";

import { useMemory } from "../hooks/use-memory";

interface Props {
  conversationId?: string;
}

export function MemoryPanel({ conversationId }: Props) {
  const { memory, loading, error, refresh } = useMemory(conversationId);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        Loading memory...
      </div>
    );
  }

  if (error) {
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

  if (memory.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-sm text-zinc-500">No memories found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memory.map((item) => (
        <MemoryCard key={item.id} memory={item} />
      ))}
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium uppercase text-zinc-400">
            {memory.type}
          </span>

          <span className="text-sm font-medium text-white">{memory.key}</span>
        </div>

        <span className="shrink-0 text-xs text-zinc-600">
          {new Date(memory.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-zinc-950 p-4">
        <pre className="whitespace-pre-wrap break-words text-sm text-zinc-300">
          {memory.value}
        </pre>
      </div>
    </div>
  );
}
