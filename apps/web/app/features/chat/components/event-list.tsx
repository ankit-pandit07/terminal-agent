"use client";

import { useChatStore } from "../store/chat.store";

export function EventList() {
  const events = useChatStore((s) => s.events);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2">
      {events.map((event, index) => {
        switch (event.type) {
          case "planning":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⚙</span>

                  <span className="text-sm font-medium text-zinc-200">
                    Planning
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  {String(event.message ?? "Planning...")}
                </p>
              </div>
            );

          case "plan-created":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>

                  <span className="text-sm font-medium text-zinc-200">
                    Plan Created
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  {String(event.steps ?? 0)} steps planned
                </p>
              </div>
            );

          case "decision": {
            const decision =
              typeof event.decision === "object" && event.decision !== null
                ? (event.decision as Record<string, unknown>)
                : {};

            return (
              <div
                key={index}
                className="rounded-lg border border-indigo-700/50 bg-indigo-950/20 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400">🧠</span>

                  <span className="text-sm font-medium text-indigo-300">
                    Agent Decision
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Decision: </span>

                    <span className="font-medium capitalize text-zinc-200">
                      {String(decision.decision ?? "Unknown")}
                    </span>
                  </p>

                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Reason: </span>

                    {String(decision.reason ?? "No reason provided.")}
                  </p>

                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Confidence: </span>
                    {Math.round(Number(decision.confidence ?? 0) * 100)}%
                  </p>

                  <p className="text-zinc-400">
                    <span className="text-zinc-500">LLM: </span>

                    {decision.useLLM === true ? "Required" : "Not required"}
                  </p>
                </div>
              </div>
            );
          }

          case "tool-start":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🔧</span>

                  <span className="text-sm font-medium text-zinc-200">
                    Tool Running
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  {String(event.tool ?? "Unknown tool")}
                </p>
              </div>
            );

          case "tool-complete":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      event.success === true ? "text-green-400" : "text-red-400"
                    }
                  >
                    {event.success === true ? "✓" : "✕"}
                  </span>

                  <span className="text-sm font-medium text-zinc-200">
                    Tool Completed
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  {String(event.tool ?? "Unknown tool")}
                </p>
              </div>
            );

          case "goal":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">🎯</span>

                  <span className="text-sm font-medium text-zinc-200">
                    Goal Evaluation
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  Goal evaluation completed.
                </p>
              </div>
            );

          case "reflection":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">💭</span>

                  <span className="text-sm font-medium text-zinc-200">
                    Reflection
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  Agent is reviewing the result.
                </p>
              </div>
            );

          case "verification":
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">🔍</span>

                  <span className="text-sm font-medium text-zinc-200">
                    Verification
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                  Verifying execution result...
                </p>
              </div>
            );

          case "recovery":
            return (
              <div
                key={index}
                className="rounded-lg border border-yellow-700/50 bg-yellow-950/20 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">↻</span>

                  <span className="text-sm font-medium text-yellow-300">
                    Recovery
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Action: </span>

                    <span className="font-medium capitalize text-zinc-200">
                      {String(event.action ?? "Unknown")}
                    </span>
                  </p>

                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Reason: </span>

                    {String(event.reason ?? "Recovery action required.")}
                  </p>

                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Confidence: </span>
                    {Math.round(Number(event.confidence ?? 0) * 100)}%
                  </p>
                </div>
              </div>
            );

          case "confirmation-required":
            return (
              <div
                key={index}
                className="rounded-lg border border-yellow-700/50 bg-yellow-950/20 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⚠️</span>

                  <span className="text-sm font-medium text-yellow-300">
                    Confirmation Required
                  </span>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                  {String(
                    event.message ?? "This action requires your confirmation.",
                  )}
                </p>
              </div>
            );

          case "completed":
  return (
    <div
      key={index}
      className="rounded-lg border border-green-900/50 bg-green-950/20 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-green-400">
          ✓
        </span>

        <span className="text-sm font-medium text-green-300">
          Task Completed
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
        {String(
          event.response ??
            "Task completed successfully."
        )}
      </p>
    </div>
  );
          case "error":
            return (
              <div
                key={index}
                className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠</span>

                  <span className="text-sm font-medium text-red-300">
                    Error
                  </span>
                </div>

                <p className="mt-1 text-sm text-red-400">
                  {String(event.message ?? "Something went wrong.")}
                </p>
              </div>
            );

          default:
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <p className="text-sm text-zinc-400">{event.type}</p>
              </div>
            );
        }
      })}
    </div>
  );
}
