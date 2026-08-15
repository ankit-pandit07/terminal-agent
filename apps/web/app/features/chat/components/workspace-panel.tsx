"use client";

import { useWorkspace } from "../hooks/use-workspace";

export function WorkspacePanel() {
  const { workspace, loading, error, refresh } = useWorkspace();

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        Loading workspace...
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

  if (!workspace) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        Workspace information is not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Project Overview</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            label="Project"
            value={workspace.projectName ?? "Unknown"}
          />

          <InfoCard label="Language" value={workspace.language} />

          <InfoCard label="Framework" value={workspace.framework ?? "None"} />

          <InfoCard label="Package Manager" value={workspace.packageManager} />

          <InfoCard label="ORM" value={workspace.orm ?? "None"} />

          <InfoCard
            label="Git"
            value={workspace.hasGit ? "Enabled" : "Not detected"}
            success={workspace.hasGit}
          />

          <InfoCard
            label="Prisma"
            value={workspace.hasPrisma ? "Enabled" : "Not detected"}
            success={workspace.hasPrisma}
          />
        </div>
      </div>

      {/* Dependencies */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Dependencies</h2>

        {workspace.dependencies.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No dependencies detected.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {workspace.dependencies.map((dependency) => (
              <span
                key={dependency}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
              >
                {dependency}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scripts */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Package Scripts</h2>

        {Object.keys(workspace.scripts).length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No scripts detected.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
            {Object.entries(workspace.scripts).map(([name, command]) => (
              <div
                key={name}
                className="flex flex-col gap-1 border-b border-zinc-800 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-zinc-200">
                  {name}
                </span>

                <code className="text-xs text-zinc-500">{command}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
  success?: boolean;
}

function InfoCard({ label, value, success }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-medium ${
          success ? "text-green-400" : "text-zinc-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
