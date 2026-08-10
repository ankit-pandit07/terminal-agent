"use client";

import { useSession } from "../hooks/use-session";

export function SessionPanel() {
  const { session, loading, error, refresh } = useSession();

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        Loading session...
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

  if (!session) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        Session information is not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current State */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Current Session</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            label="Current Directory"
            value={session.currentDirectory}
          />

          <InfoCard label="Last Tool" value={session.lastTool ?? "None"} />

          <InfoCard label="Retry Count" value={String(session.retryCount)} />
        </div>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Last Error
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
            {session.lastError ?? "None"}
          </p>
        </div>
      </div>

      <SessionList title="Executed Commands" items={session.executedCommands} />

      <SessionList
        title="Successful Commands"
        items={session.successfulCommands}
      />

      <SessionList title="Failed Commands" items={session.failedCommands} />

      <SessionList title="Modified Files" items={session.modifiedFiles} />

      <SessionList
        title="Visited Directories"
        items={session.visitedDirectories}
      />

      <SessionList title="Recovery History" items={session.recoveryHistory} />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-medium text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function SessionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">None</p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <pre className="whitespace-pre-wrap break-all text-sm text-zinc-300">
                {item}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
