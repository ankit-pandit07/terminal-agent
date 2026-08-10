"use client";

import clsx from "clsx";
import type { Execution } from "../api/execution.api";

interface Props {
  execution: Execution;
}

export function ExecutionDetail({ execution }: Props) {
  const completed = execution.status === "COMPLETED";

  const failed = execution.status === "FAILED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Execution
            </p>

            <h1 className="mt-2 text-xl font-semibold text-white">
              {execution.goal}
            </h1>
          </div>

          <span
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium",
              completed && "bg-green-500/10 text-green-400",
              failed && "bg-red-500/10 text-red-400",
              !completed && !failed && "bg-yellow-500/10 text-yellow-400",
            )}
          >
            {execution.status}
          </span>
        </div>

        {/* Metadata */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500">Started</p>

            <p className="mt-1 text-sm text-zinc-300">
              {new Date(execution.startedAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">Finished</p>

            <p className="mt-1 text-sm text-zinc-300">
              {execution.finishedAt
                ? new Date(execution.finishedAt).toLocaleString()
                : "Still running"}
            </p>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Tool Executions
        </h2>

        {execution.toolExecutions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
            No tools were executed.
          </div>
        ) : (
          <div className="space-y-4">
            {execution.toolExecutions.map((tool, index) => (
              <div
                key={tool.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600">#{index + 1}</span>

                    <span className="font-medium text-white">{tool.tool}</span>
                  </div>

                  <span
                    className={
                      tool.success
                        ? "text-sm text-green-400"
                        : "text-sm text-red-400"
                    }
                  >
                    {tool.success ? "✓ Success" : "✕ Failed"}
                  </span>
                </div>

                {/* Input */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Input
                  </p>

                  <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
                    {formatJson(tool.input)}
                  </pre>
                </div>

                {/* Output */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Output
                  </p>

                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
                    {tool.output || "No output"}
                  </pre>
                </div>

                {/* Time */}
                <p className="mt-3 text-xs text-zinc-600">
                  {new Date(tool.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
