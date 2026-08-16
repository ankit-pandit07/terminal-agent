"use client";

import {
  Layers,
  Wrench,
} from "lucide-react";
import type { Execution } from "../api/execution.api";
import { StatusBadge } from "@/components/shared/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { JsonViewer } from "@/components/shared/json-viewer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  execution: Execution;
}

export function ExecutionDetail({ execution }: Props) {
  const started = new Date(execution.startedAt);
  const finished = execution.finishedAt ? new Date(execution.finishedAt) : null;
  const durationMs = finished ? finished.getTime() - started.getTime() : null;

  return (
    <div className="space-y-6">
      {/* Execution Summary Card */}
      <Card className="border-zinc-800 bg-zinc-900/70 shadow-lg">
        <CardHeader className="pb-4 border-b border-zinc-800/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Execution Trace
                </span>
                <span className="font-mono text-[11px] text-zinc-600">
                  #{execution.id.slice(0, 8)}
                </span>
              </div>
              <CardTitle className="text-lg text-white font-bold leading-snug">
                {execution.goal}
              </CardTitle>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <StatusBadge status={execution.status} />
              <CopyButton text={JSON.stringify(execution, null, 2)} size="icon-sm" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Started At
              </p>
              <p className="text-xs font-mono text-zinc-200">
                {started.toLocaleTimeString()}
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Finished At
              </p>
              <p className="text-xs font-mono text-zinc-200">
                {finished ? finished.toLocaleTimeString() : "In Progress"}
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Duration
              </p>
              <p className="text-xs font-mono text-zinc-200">
                {durationMs !== null ? `${(durationMs / 1000).toFixed(2)}s` : "Running..."}
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Tools Executed
              </p>
              <p className="text-xs font-mono font-semibold text-blue-400">
                {execution.toolExecutions.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Executions Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tool Executions & Observations
            </h3>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono">
            {execution.toolExecutions.length} tool(s)
          </Badge>
        </div>

        {execution.toolExecutions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
            No tools were executed during this run.
          </div>
        ) : (
          <div className="space-y-4">
            {execution.toolExecutions.map((tool, index) => {
              const isSuccess = tool.success;

              return (
                <div
                  key={tool.id}
                  className={cn(
                    "rounded-xl border bg-zinc-900/70 p-5 shadow-md transition-colors",
                    isSuccess
                      ? "border-zinc-800 hover:border-zinc-700"
                      : "border-rose-900/40 bg-rose-950/10",
                  )}
                >
                  {/* Tool Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-xs font-bold text-blue-400 border border-zinc-700">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-sm font-semibold font-mono text-white">
                          {tool.tool}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(tool.createdAt).toLocaleTimeString()}
                      </span>
                      <StatusBadge status={isSuccess ? "SUCCESS" : "FAILED"} size="sm" />
                    </div>
                  </div>

                  {/* Input parameters */}
                  <div className="mt-4">
                    <JsonViewer
                      data={tool.input}
                      title="Tool Input Arguments"
                      initialExpanded={false}
                      maxHeight="max-h-36"
                    />
                  </div>

                  {/* Output content */}
                  <div className="mt-3">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/90 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-3 py-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Execution Output
                        </span>
                        <CopyButton text={tool.output || ""} size="icon-sm" />
                      </div>
                      <pre className="max-h-80 overflow-auto p-3.5 font-mono text-[11.5px] leading-relaxed text-zinc-200 whitespace-pre-wrap selection:bg-zinc-800">
                        {tool.output || "No output returned."}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
