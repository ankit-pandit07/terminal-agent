"use client";

import clsx from "clsx";

type Props = {
  id: string;
  title: string;
  active: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
};

export function ConversationItem({
  id,
  title,
  active,
  onClick,
  onDelete,
}: Props) {
  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    onDelete(id);
  }

  return (
    <div
      className={clsx(
        "group flex w-full items-center rounded-md",
        active
          ? "bg-zinc-700"
          : "hover:bg-zinc-800"
      )}
    >
      {/* Conversation */}
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 px-3 py-2 text-left"
      >
        <span className="block truncate text-sm text-zinc-200">
          {title}
        </span>
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        className="
          mr-2
          flex h-7 w-7
          shrink-0
          items-center justify-center
          rounded-md
          text-zinc-500
          opacity-0
          transition
          group-hover:opacity-100
          hover:bg-red-500/20
          hover:text-red-400
        "
        title="Delete conversation"
        aria-label={`Delete ${title}`}
      >
        🗑
      </button>
    </div>
  );
}