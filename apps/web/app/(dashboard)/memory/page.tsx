"use client";

import { useSearchParams } from "next/navigation";
import { MemoryPanel } from "../../features/chat/components/memory-panel";

export default function MemoryPage() {
  const searchParams = useSearchParams();

  const conversationId = searchParams.get("conversation");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Memory</h1>

            <p className="mt-1 text-sm text-zinc-500">
              View memories created by the Terminal Agent.
            </p>
          </div>
        </div>

        <MemoryPanel conversationId={conversationId ?? undefined} />
      </div>
    </div>
  );
}
