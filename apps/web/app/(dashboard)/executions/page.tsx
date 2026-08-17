"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, MessageSquare } from "lucide-react";
import { useExecutions } from "@/app/features/chat/hooks/use-executions";
import { useConversations } from "@/app/features/chat/hooks/use-conversation";
import { ExecutionList } from "@/app/features/chat/components/execution-list";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");

  const { conversations, loading: conversationsLoading } = useConversations();
  const { executions, loading, error, refresh } = useExecutions(
    conversationId ?? undefined,
  );

  function handleSelectConversation(id: string) {
    if (id) {
      router.push(`/executions?conversation=${id}`);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Execution History"
          description="View real-time traces, tool call parameters, observations, and run status."
          actions={
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <Select
                  value={conversationId ?? ""}
                  onValueChange={handleSelectConversation}
                  disabled={conversationsLoading}
                >
                  <SelectTrigger className="h-9 w-full bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 shadow-xs">
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <SelectValue
                        placeholder={
                          conversationsLoading
                            ? "Loading chats..."
                            : "Select conversation..."
                        }
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-zinc-800 bg-zinc-950 text-zinc-200">
                    <SelectGroup>
                      <SelectLabel>
                        Conversations ({conversations.length})
                      </SelectLabel>
                      {conversations.map((conv) => (
                        <SelectItem
                          key={conv.id}
                          value={conv.id}
                          className="text-xs focus:bg-zinc-800"
                        >
                          <span className="truncate">
                            {conv.title || "Untitled Conversation"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {conversationId && (
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
              )}
            </div>
          }
        />

        {/* No conversation selected state */}
        {!conversationId && (
          <div className="space-y-6">
            <EmptyState
              icon={MessageSquare}
              title="No conversation selected"
              description="Choose a conversation from the selector above or pick one below to view its execution traces and tool logs."
            />

            {conversations.length > 0 && (
              <div className="mx-auto max-w-lg space-y-3">
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Quick Pick Recent Conversation
                </p>
                <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-md">
                  {conversations.slice(0, 5).map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv.id)}
                      className="flex w-full items-center justify-between p-3.5 text-left text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <MessageSquare className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="truncate font-medium">
                          {conv.title || "Untitled Conversation"}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                        View traces →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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

