"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MemoryPanel } from "@/app/features/chat/components/memory-panel";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";

export default function MemoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <ListSkeleton count={4} />
        </div>
      }
    >
      <MemoryContent />
    </Suspense>
  );
}

function MemoryContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Agent Memory"
          description="Contextual memories, outputs, and observations stored during conversational tasks."
        />

        <MemoryPanel conversationId={conversationId ?? undefined} />
      </div>
    </div>
  );
}
