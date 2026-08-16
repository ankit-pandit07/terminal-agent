"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, MessageSquare } from "lucide-react";
import { useExecutions } from "@/app/features/chat/hooks/use-executions";
import { ExecutionList } from "@/app/features/chat/components/execution-list";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function ExecutionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <ListSkeleton count={4} />
        </div>
      }
    >
      <ExecutionContent />
    </Suspense>
  );
}

function ExecutionContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");

  const { executions, loading, error, refresh } = useExecutions(
    conversationId ?? undefined,
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Execution History"
          description="View real-time traces, tool call parameters, observations, and run status."
          actions={
            conversationId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refresh()}
                disabled={loading}
                className="gap-2 border-zinc-800 text-zinc-300 hover:text-white"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </Button>
            ) : undefined
          }
        />

        {/* No conversation selected state */}
        {!conversationId && (
          <EmptyState
            icon={MessageSquare}
            title="No conversation selected"
            description="Select a conversation from the left sidebar to view its execution traces and tool logs."
          />
        )}

        {/* Loading state */}
        {conversationId && loading && <ListSkeleton count={4} />}

        {/* Error state */}
        {conversationId && error && !loading && (
          <ErrorState
            title="Failed to load executions"
            error={error}
            onRetry={() => void refresh()}
          />
        )}

        {/* Executions list */}
        {conversationId && !loading && !error && (
          <ExecutionList executions={executions} />
        )}
      </div>
    </div>
  );
}
