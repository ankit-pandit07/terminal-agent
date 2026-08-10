"use client";

import { Execution } from "../api/execution.api";
import clsx from "clsx";

interface Props {
  executions: Execution[];
}

export function ExecutionList({ executions }: Props) {
  if (executions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-500">
        No executions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {executions.map((execution) => {
        const completed = execution.status === "COMPLETED";

        const failed = execution.status === "FAILED";

        return (
          <div
            key={execution.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  {execution.goal}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(execution.startedAt).toLocaleString()}
                </p>
              </div>

              <span
                className={clsx(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
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
          </div>
        );
      })}
    </div>
  );
}
