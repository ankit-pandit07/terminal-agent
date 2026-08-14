"use client";

import { useState } from "react";
import { usePlanner } from "../hooks/use-planner";

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
    if (!message.trim()) return;

    await generatePlan(message);
  }

  return (
    <div className="space-y-6">
      {/* Task Input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Create Plan</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Describe what you want the agent to do.
        </p>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Example: Check my Node.js version"
          rows={4}
          className="mt-4 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void handleCreatePlan()}
            disabled={loading || !message.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>

          {(plan || result) && (
            <button
              type="button"
              onClick={clear}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Plan */}
      {plan && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Plan</h2>

              <p className="mt-1 text-xs text-zinc-500">
                Source: {plan.source}
              </p>
            </div>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
              {plan.steps.length} {plan.steps.length === 1 ? "step" : "steps"}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {plan.steps.map((step, index) => (
              <div
                key={`${step.tool}-${index}`}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="font-medium text-white">{step.tool}</p>

                    {step.reason && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {step.reason}
                      </p>
                    )}

                    <pre className="mt-3 overflow-x-auto rounded-md bg-black p-3 text-xs text-zinc-400">
                      {JSON.stringify(step.input, null, 2)}
                    </pre>

                    {step.priority !== undefined && (
                      <p className="mt-2 text-xs text-zinc-600">
                        Priority: {step.priority}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plan.steps.length > 0 && (
            <button
              type="button"
              onClick={() => void runPlan()}
              disabled={executing}
              className="mt-5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {executing ? "Executing..." : "Execute Plan"}
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Execution Result
            </h2>

            <span
              className={
                result.requiresConfirmation
                  ? "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                  : result.success
                    ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                    : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
              }
            >
              {result.requiresConfirmation
                ? "Confirmation Required"
                : result.success
                  ? "Success"
                  : "Failed"}
            </span>
          </div>

          {/* Confirmation */}
          {result.requiresConfirmation && result.confirmationId ? (
            <div className="mt-4 rounded-xl border border-yellow-700/50 bg-yellow-950/20 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>

                <h3 className="font-semibold text-yellow-400">
                  Confirmation Required
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {result.output}
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => void cancelPlan()}
                  disabled={executing}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {executing ? "Processing..." : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={() => void confirmPlan()}
                  disabled={executing}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {executing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          ) : (
            /* Normal execution result */
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-sm text-zinc-300">
              {result.output || "No output"}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
