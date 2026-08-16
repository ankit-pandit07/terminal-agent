"use client";

import { useState } from "react";
import {
  Cog,
  ListTodo,
  Brain,
  Wrench,
  CheckCircle2,
  XCircle,
  Target,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { useChatStore } from "../store/chat.store";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/shared/json-viewer";
import { cn } from "@/lib/utils";

export function EventList() {
  const events = useChatStore((s) => s.events);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Agent Activity Timeline
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-600">
          {events.length} {events.length === 1 ? "step" : "steps"}
        </span>
      </div>

      <div className="space-y-2.5">
        {events.map((event, index) => (
          <EventCard key={`${event.type}-${index}`} event={event as Record<string, unknown>} index={index} />
        ))}
      </div>
    </div>
  );
}

function EventCard({
  event,
  index,
}: {
  event: Record<string, unknown>;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const type = String(event.type ?? "event");

  switch (type) {
    case "planning":
      return (
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/20 text-blue-400">
                <Cog className="h-3.5 w-3.5 animate-spin" />
              </div>
              <span className="text-xs font-semibold text-blue-300">
                Planning Task
              </span>
            </div>
            <Badge variant="info" className="text-[10px]">
              Analyzing
            </Badge>
          </div>
          <p className="mt-2 text-xs text-zinc-300 pl-8">
            {String(event.message ?? "Formulating execution plan...")}
          </p>
        </div>
      );

    case "plan-created":
      return (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600/20 text-emerald-400">
                <ListTodo className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                Plan Created
              </span>
            </div>
            <Badge variant="success" className="text-[10px]">
              {String(event.steps ?? 0)} steps
            </Badge>
          </div>
          <p className="mt-2 text-xs text-zinc-300 pl-8">
            Generated a structured plan with {String(event.steps ?? 0)} execution step(s).
          </p>
        </div>
      );

    case "decision": {
      const decision =
        typeof event.decision === "object" && event.decision !== null
          ? (event.decision as Record<string, unknown>)
          : {};
      const confidence = Math.round(Number(decision.confidence ?? 0) * 100);

      return (
        <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/20 text-indigo-400">
                <Brain className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-indigo-300">
                Agent Decision
              </span>
            </div>
            <Badge variant="default" className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 text-[10px]">
              {confidence}% Confidence
            </Badge>
          </div>

          <div className="mt-2 space-y-1 text-xs text-zinc-300 pl-8">
            <p>
              <span className="text-zinc-500">Action: </span>
              <span className="font-semibold text-zinc-200 capitalize">
                {String(decision.decision ?? "Execute")}
              </span>
            </p>
            {decision.reason !== undefined && (
              <p>
                <span className="text-zinc-500">Reason: </span>
                <span>{String(decision.reason)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }

    case "tool-start":
      return (
        <div className="rounded-xl border border-amber-900/30 bg-amber-950/15 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600/20 text-amber-400">
                <Wrench className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-amber-300">
                Tool Running
              </span>
            </div>
            <Badge variant="warning" className="text-[10px]">
              Executing
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-2 pl-8 text-xs font-mono text-zinc-300">
            <Terminal className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-semibold text-amber-400">{String(event.tool ?? "unknown")}</span>
          </div>
        </div>
      );

    case "tool-complete": {
      const isSuccess = event.success === true;
      return (
        <div
          className={cn(
            "rounded-xl border p-3.5 shadow-xs transition-colors",
            isSuccess
              ? "border-emerald-900/30 bg-emerald-950/15"
              : "border-rose-900/30 bg-rose-950/15",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md",
                  isSuccess
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "bg-rose-600/20 text-rose-400",
                )}
              >
                {isSuccess ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold",
                  isSuccess ? "text-emerald-300" : "text-rose-300",
                )}
              >
                Tool Completed
              </span>
            </div>
            <Badge
              variant={isSuccess ? "success" : "destructive"}
              className="text-[10px]"
            >
              {isSuccess ? "Success" : "Failed"}
            </Badge>
          </div>

          <div className="mt-2 flex items-center justify-between pl-8 text-xs font-mono text-zinc-300">
            <span>
              Tool: <strong className="text-white">{String(event.tool)}</strong>
            </span>
            {event.output !== undefined && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
              >
                <span>{expanded ? "Hide output" : "Show output"}</span>
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {expanded && event.output !== undefined && (
            <div className="mt-2 pl-8">
              <pre className="max-h-40 overflow-auto rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                {String(event.output)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    case "goal":
      return (
        <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600/20 text-purple-400">
                <Target className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-purple-300">
                Goal Evaluation
              </span>
            </div>
            <Badge variant="default" className="bg-purple-500/15 text-purple-300 border-purple-500/20 text-[10px]">
              Evaluated
            </Badge>
          </div>
          <p className="mt-2 text-xs text-zinc-300 pl-8">
            Goal satisfaction criteria evaluated against observation.
          </p>
        </div>
      );

    case "reflection":
      return (
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-600/20 text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-cyan-300">
                Reflection
              </span>
            </div>
            <Badge variant="info" className="bg-cyan-500/15 text-cyan-300 border-cyan-500/20 text-[10px]">
              Reflecting
            </Badge>
          </div>
          <p className="mt-2 text-xs text-zinc-300 pl-8">
            Agent reviewed the operation result and confirmed state alignment.
          </p>
        </div>
      );

    case "verification": {
      const ver =
        typeof event.verification === "object" && event.verification !== null
          ? (event.verification as Record<string, unknown>)
          : {};
      const status = String(ver.status ?? event.status ?? "verifying");
      const isPassed = status === "completed" || status === "passed";

      return (
        <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-600/20 text-orange-400">
                {isPassed ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-orange-400" />
                )}
              </div>
              <span className="text-xs font-semibold text-orange-300">
                Verification
              </span>
            </div>
            <Badge
              variant={isPassed ? "success" : "warning"}
              className="text-[10px]"
            >
              {isPassed ? "Passed" : "Checking"}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-zinc-300 pl-8">
            {isPassed
              ? "All execution verification checks passed cleanly."
              : "Verifying goal conditions and execution results..."}
          </p>
        </div>
      );
    }

    case "recovery": {
      const confidence = Math.round(Number(event.confidence ?? 0) * 100);
      return (
        <div className="rounded-xl border border-amber-800/50 bg-amber-950/25 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600/20 text-amber-400">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              </div>
              <span className="text-xs font-semibold text-amber-300">
                Auto-Recovery Strategy
              </span>
            </div>
            <Badge variant="warning" className="text-[10px]">
              {confidence}% Confidence
            </Badge>
          </div>

          <div className="mt-2 space-y-1 text-xs text-zinc-300 pl-8">
            <p>
              <span className="text-zinc-500">Action: </span>
              <span className="font-semibold text-amber-300 uppercase">
                {String(event.action ?? "Retry")}
              </span>
            </p>
            <p>
              <span className="text-zinc-500">Reason: </span>
              <span>{String(event.reason ?? "Executing fallback strategy.")}</span>
            </p>
          </div>
        </div>
      );
    }

    case "confirmation-required":
      return (
        <div className="rounded-xl border border-amber-500/50 bg-amber-950/40 p-4 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                User Confirmation Required
              </span>
              <p className="text-[11px] text-zinc-400">High-impact command guardrail</p>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-zinc-200 leading-relaxed pl-9">
            {String(event.message ?? "This action requires your confirmation.")}
          </p>
        </div>
      );

    case "completed":
      return (
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/25 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600/20 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                Execution Completed
              </span>
            </div>
            <Badge variant="success" className="text-[10px]">
              Finished
            </Badge>
          </div>
          <p className="mt-2 text-xs text-zinc-300 pl-8 leading-relaxed whitespace-pre-wrap">
            {String(event.response ?? "Task finished successfully.")}
          </p>
        </div>
      );

    case "error":
      return (
        <div className="rounded-xl border border-rose-800/50 bg-rose-950/25 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600/20 text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-rose-300">
                Execution Error
              </span>
            </div>
            <Badge variant="destructive" className="text-[10px]">
              Error
            </Badge>
          </div>
          <p className="mt-2 text-xs text-rose-300 pl-8 leading-relaxed">
            {String(event.message ?? "An unexpected error occurred.")}
          </p>
        </div>
      );

    default:
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">{type}</span>
            <span className="text-[11px] font-mono text-zinc-600">#{index + 1}</span>
          </div>
          <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-zinc-950 p-2 font-mono text-[11px] text-zinc-400">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      );
  }
}
