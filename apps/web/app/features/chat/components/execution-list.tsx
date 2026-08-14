"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { Execution } from "../api/execution.api";

interface Props {
  executions: Execution[];
}

export function ExecutionList({ executions }: Props) {
  const router = useRouter();

  if (executions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        No executions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {executions.map((execution) => {
        const completed = execution.status === "SUCCESS";

        const failed = execution.status === "FAILED";

        return (
          <button
            key={execution.id}
            type="button"
            onClick={() => router.push(`/executions/${execution.id}`)}
            className="w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {execution.goal}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(execution.startedAt).toLocaleString()}
                </p>
              </div>

              <span
                className={clsx(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  completed && "bg-green-500/10 text-green-400",
                  failed && "bg-red-500/10 text-red-400",
                  !completed && !failed && "bg-yellow-500/10 text-yellow-400",
                )}
              >
                {execution.status}
              </span>
            </div>

            {execution.toolExecutions.length > 0 && (
              <div className="mt-4 border-t border-zinc-800 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Tools
                </p>

                <div className="space-y-1">
                  {execution.toolExecutions.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-300">{tool.tool}</span>

                      <span
                        className={
                          tool.success ? "text-green-400" : "text-red-400"
                        }
                      >
                        {tool.success ? "✓" : "✕"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
