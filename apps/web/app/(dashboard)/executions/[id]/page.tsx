"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useExecution } from "@/app/features/chat/hooks/use-execution";
import { ExecutionDetail } from "@/app/features/chat/components/execution-detail";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function ExecutionDetailPage() {
  const params = useParams<{ id: string }>();
  const executionId = params?.id;

  return (
    <Suspense
      fallback={
        <div className="p-8">
          <ListSkeleton count={3} />
        </div>
      }
    >
      <ExecutionContent executionId={executionId} />
    </Suspense>
  );
}

function ExecutionContent({ executionId }: { executionId?: string }) {
  const router = useRouter();
  const { execution, loading, error, refresh } = useExecution(executionId);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to executions</span>
          </Button>
        </div>

        {loading && <ListSkeleton count={3} />}

        {error && !loading && (
          <ErrorState
            title="Failed to load execution trace"
            error={error}
            onRetry={() => void refresh()}
          />
        )}

        {!loading && !error && !execution && (
          <EmptyState
            icon={ArrowLeft}
            title="Execution trace not found"
            description="The requested execution ID could not be found or has been removed."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/executions")}
              >
                View all executions
              </Button>
            }
          />
        )}

        {!loading && !error && execution && (
          <ExecutionDetail execution={execution} />
        )}
      </div>
    </div>
  );
}
