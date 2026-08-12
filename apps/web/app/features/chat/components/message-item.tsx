"use client";

import clsx from "clsx";
import { Message } from "../store/chat.store";

interface Props {
  message: Message;
}

export function MessageItem({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={clsx("mb-6 flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={clsx(
          "w-fit max-w-[80%] rounded-2xl px-5 py-4 shadow-lg transition-all",
          isUser
            ? "bg-blue-600 text-white"
            : "border border-zinc-800 bg-zinc-900 text-zinc-100",
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold opacity-80">
          <span className="text-base">{isUser ? "👤" : "🤖"}</span>

          <span>{isUser ? "You" : "Assistant"}</span>
        </div>

        <p className="whitespace-pre-wrap break-words text-sm leading-7">
          {message.content}
        </p>
      </div>
    </div>
  );
}
