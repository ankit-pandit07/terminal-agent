"use client";

import { useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface Props {
  id: string;
  title: string;
  active: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  id,
  title,
  active,
  onClick,
  onDelete,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all cursor-pointer select-none",
          active
            ? "bg-zinc-800 text-white shadow-xs"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageSquare
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-colors",
              active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-400",
            )}
          />
          <span className="truncate text-left">{title || "Untitled Chat"}</span>
        </div>

        <button
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setDeleteOpen(true);
          }}
          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
          title="Delete chat"
          aria-label={`Delete ${title}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this conversation and its associated execution logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}