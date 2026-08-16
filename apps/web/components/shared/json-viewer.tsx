"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CopyButton } from "./copy-button";
import { cn } from "../../lib/utils";

interface JsonViewerProps {
  data: unknown;
  title?: string;
  initialExpanded?: boolean;
  maxHeight?: string;
  className?: string;
}

export function JsonViewer({
  data,
  title,
  initialExpanded = true,
  maxHeight = "max-h-72",
  className,
}: JsonViewerProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  let formatted = "";
  try {
    if (typeof data === "string") {
      try {
        formatted = JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        formatted = data;
      }
    } else {
      formatted = JSON.stringify(data, null, 2);
    }
  } catch {
    formatted = String(data);
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/90 font-mono text-xs shadow-inner",
        className,
      )}
    >
      {title && (
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-3 py-1.5 select-none hover:bg-zinc-900"
        >
          <div className="flex items-center gap-1.5 text-zinc-400">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <CopyButton text={formatted} size="icon-sm" />
          </div>
        </div>
      )}

      {expanded && (
        <div className="relative">
          {!title && (
            <div className="absolute right-2 top-2 z-10">
              <CopyButton text={formatted} size="icon-sm" />
            </div>
          )}
          <pre
            className={cn(
              "overflow-auto p-3.5 font-mono text-[11.5px] leading-relaxed text-zinc-300 selection:bg-zinc-800",
              maxHeight,
            )}
          >
            {formatted}
          </pre>
        </div>
      )}
    </div>
  );
}
