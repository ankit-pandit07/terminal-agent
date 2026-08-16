"use client";

import { User, Bot } from "lucide-react";
import { Message } from "../store/chat.store";
import { CopyButton } from "@/components/shared/copy-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  message: Message;
}

export function MessageItem({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group mb-6 flex gap-3.5 transition-opacity",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0 shadow-md",
          isUser
            ? "border-blue-500/40 bg-blue-600 text-white"
            : "border-zinc-700 bg-zinc-800 text-zinc-300",
        )}
      >
        <AvatarFallback
          className={cn(
            "text-xs font-bold",
            isUser ? "bg-blue-600 text-white" : "bg-zinc-800 text-blue-400",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Bubble Container */}
      <div
        className={cn(
          "flex max-w-[85%] flex-col sm:max-w-[75%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Header Name & Timestamp */}
        <div
          className={cn(
            "mb-1 flex items-center gap-2 px-1 text-[11px] font-medium text-zinc-500",
            isUser && "flex-row-reverse",
          )}
        >
          <span className="text-zinc-400 font-semibold">
            {isUser ? "You" : "Terminal Agent"}
          </span>
          <span>·</span>
          <span>Just now</span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3.5 shadow-md transition-all leading-relaxed text-sm",
            isUser
              ? "rounded-tr-xs bg-blue-600 text-white selection:bg-blue-800 selection:text-white"
              : "rounded-tl-xs border border-zinc-800 bg-zinc-900/90 text-zinc-100 selection:bg-zinc-800",
          )}
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>

          {/* Copy Button Hover */}
          {!isUser && (
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={message.content} size="icon-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
