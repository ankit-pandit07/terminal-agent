"use client";

import { useSearchParams } from "next/navigation";

import { useExecutions } from "../../features/chat/hooks/use-executions";
import { ExecutionList } from "../../features/chat/components/execution-list";

export default function ExecutionPage() {
  const searchParams = useSearchParams();

  const conversationId = searchParams.get("conversation");

  const { executions, loading, error, refresh } = useExecutions(
    conversationId ?? undefined,
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Executions</h1>

            <p className="mt-1 text-sm text-zinc-500">
              View agent execution history and tool activity.
            </p>
          </div>

          {conversationId && (
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {/* No conversation selected */}
        {!conversationId && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h2 className="text-lg font-medium text-white">
              No conversation selected
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Open a conversation first to view its executions.
            </p>
          </div>
        )}

        {/* Loading */}
        {conversationId && loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-500">
            Loading executions...
          </div>
        )}

        {/* Error */}
        {conversationId && error && !loading && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>

            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Executions */}
        {conversationId && !loading && !error && (
          <ExecutionList executions={executions} />
        )}
      </div>
    </div>
  );
}
