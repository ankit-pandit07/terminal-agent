"use client";

import { useState } from "react";
import { MessageSquare, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "../lib/format-relative-time";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConversationItemProps {
  id: string;
  title: string | null;
  timestamp?: string;
  active: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  id,
  title,
  timestamp,
  active,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const displayTitle = title?.trim() || "Untitled Conversation";
  const relativeTime = formatRelativeTime(timestamp);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "group relative flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-xs transition-all cursor-pointer select-none border",
          active
            ? "bg-zinc-900 border-zinc-700/80 text-white shadow-xs"
            : "border-transparent text-zinc-400 hover:bg-zinc-900/70 hover:border-zinc-800/80 hover:text-zinc-200"
        )}
      >
        {/* Main Row: Icon, Title & Delete Trigger */}
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-400"
              )}
            />
            <span
              className={cn(
                "truncate font-medium text-left leading-tight",
                active ? "text-white font-semibold" : "text-zinc-300"
              )}
              title={displayTitle}
            >
              {displayTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 focus:opacity-100 cursor-pointer"
            title="Delete conversation"
            aria-label={`Delete ${displayTitle}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Sub Row: Relative Time badge */}
        {relativeTime && (
          <div className="mt-1 flex items-center gap-1 pl-5.5 text-[10px] text-zinc-500 font-mono">
            <Clock className="h-2.5 w-2.5 shrink-0 text-zinc-600" />
            <span>{relativeTime}</span>
          </div>
        )}

        {/* Active Pill Indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r bg-blue-500" />
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs leading-relaxed">
              This will permanently remove <span className="text-white font-medium">&quot;{displayTitle}&quot;</span> and all its recorded message history and execution logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id)}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}