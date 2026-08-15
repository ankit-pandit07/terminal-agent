"use client";

import { useParams, useRouter } from "next/navigation";

import { useExecution } from "../../../features/chat/hooks/use-execution";
import { ExecutionDetail } from "../../../features/chat/components/execution-detail";


export default function ExecutionDetailPage() {
  const params = useParams<{ id: string }>();

  const executionId = params.id;

  return <ExecutionContent executionId={executionId} />;
}

function ExecutionContent({ executionId }: { executionId: string }) {
  const router = useRouter();

  const { execution, loading, error, refresh } = useExecution(executionId);

  if (loading) {
    return (
      <div className="p-8 text-sm text-zinc-500">Loading execution...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">{error}</p>

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!execution) {
    return <div className="p-8 text-zinc-500">Execution not found.</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 text-sm text-zinc-400 hover:text-white"
        >
          ← Back to executions
        </button>

        <ExecutionDetail execution={execution} />
      </div>
    </div>
  );
}
