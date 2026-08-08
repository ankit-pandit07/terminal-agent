"use client";

import clsx from "clsx";

type Props = {
  id: string;
  title: string;
  active: boolean;
  onClick: () => void;
};

export function ConversationItem({ title, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full rounded-md px-3 py-2 text-left",
        active ? "bg-zinc-700" : "hover:bg-zinc-800",
      )}
    >
      {title}
    </button>
  );
}
