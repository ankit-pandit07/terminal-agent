"use client";

import { useState } from "react";
import {
  ListTodo,
  Play,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { usePlanner } from "../hooks/use-planner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { JsonViewer } from "@/components/shared/json-viewer";
import { cn } from "@/lib/utils";

const EXAMPLE_PLANS = [
  "Check installed Node.js and NPM versions",
  "Inspect current Git status and modified files",
  "Run the application test suite and build verification",
  "Analyze workspace dependencies and package scripts",
];

export function PlannerPanel() {
  const [message, setMessage] = useState("");

  const {
    plan,
    result,
    loading,
    executing,
    error,
    generatePlan,
    runPlan,
    confirmPlan,
    cancelPlan,
    clear,
  } = usePlanner();

  async function handleCreatePlan() {
    if (!message.trim() || loading) return;
    await generatePlan(message);
  }

  function handleChipClick(example: string) {
    setMessage(example);
  }

  return (
    <div className="space-y-6">
      {/* Task Input Card */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ListTodo className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Define Agent Goal</CardTitle>
            </div>
            <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              Autonomous Planner
            </Badge>
          </div>
          <CardDescription>
            Specify an objective. The planner will generate an optimized, multi-step tool execution plan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="e.g. Inspect package dependencies and check if build command succeeds"
            rows={3}
            disabled={loading || executing}
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden disabled:opacity-50"
          />

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">Examples:</span>
            {EXAMPLE_PLANS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChipClick(ex)}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => void handleCreatePlan()}
              disabled={loading || executing || !message.trim()}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Plan</span>
                </>
              )}
            </Button>

            {(plan || result) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                disabled={executing}
                className="gap-1.5 text-zinc-400 hover:text-white border-zinc-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-xs text-red-400 shadow-sm flex items-center gap-2.5">
          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Structured Plan Section */}
      {plan && (
        <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
          <CardHeader className="pb-4 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Generated Plan</CardTitle>
                  <Badge variant="default" className="bg-zinc-800 text-zinc-300">
                    Source: {plan.source}
                  </Badge>
                </div>
                <CardDescription>
                  Review the scheduled tool steps before executing.
                </CardDescription>
              </div>

              <Badge variant="info" className="text-xs">
                {plan.steps.length} {plan.steps.length === 1 ? "step" : "steps"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-5">
            {plan.steps.map((step, index) => (
              <div
                key={`${step.tool}-${index}`}
                className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-blue-400 border border-zinc-700">
                      {index + 1}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-semibold text-sm text-white font-mono">
                          {step.tool}
                        </span>
                        {step.priority !== undefined && (
                          <Badge variant="outline" className="text-[10px] text-zinc-400">
                            Priority: {step.priority}
                          </Badge>
                        )}
                      </div>

                      {step.reason && (
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {step.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pl-10">
                  <JsonViewer
                    data={step.input}
                    title="Tool Parameters"
                    initialExpanded={false}
                    maxHeight="max-h-36"
                  />
                </div>
              </div>
            ))}
          </CardContent>

          {plan.steps.length > 0 && (
            <CardFooter className="border-t border-zinc-800/80 pt-4 flex justify-end">
              <Button
                onClick={() => void runPlan()}
                disabled={executing}
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                {executing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing Steps...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Execute Plan</span>
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Execution Result */}
      {result && (
        <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Execution Result</CardTitle>
              <StatusBadge
                status={
                  result.requiresConfirmation
                    ? "CONFIRMATION"
                    : result.success
                      ? "SUCCESS"
                      : "FAILED"
                }
              />
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            {result.requiresConfirmation && result.confirmationId ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Approval Required
                    </h4>
                    <p className="text-[11px] text-zinc-400">Confirmation guardrail</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap pl-9">
                  {result.output}
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void cancelPlan()}
                    disabled={executing}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void confirmPlan()}
                    disabled={executing}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    {executing ? "Processing..." : "Confirm & Execute"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Output stream:</span>
                  {result.success ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Success
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-medium">
                      <XCircle className="h-3.5 w-3.5" /> Failed
                    </span>
                  )}
                </div>

                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-200 border border-zinc-800/80 leading-relaxed">
                  {result.output || "No output recorded."}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
