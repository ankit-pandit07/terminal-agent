import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface ErrorStateProps {
  title?: string;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  error = "An unexpected error occurred while communicating with the server.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red-900/40 bg-red-950/15 p-6 text-center sm:p-8",
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-800/40 bg-red-900/30 text-red-400">
        <AlertCircle className="h-5 w-5" />
      </div>

      <h4 className="mt-3 text-sm font-semibold text-red-200">{title}</h4>

      <p className="mt-1 max-w-md text-xs text-red-300/80 leading-relaxed">
        {error || "An unexpected error occurred."}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-1.5 border-red-800/40 bg-red-900/20 text-red-200 hover:bg-red-900/40 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
