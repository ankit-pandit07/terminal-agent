"use client"
import { useChatStore } from "../store/chat.store";
import { MessageList } from "./message-list";
import { useEffect, useRef } from "react";

export function ChatWindow() {
  const messages = useChatStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
   <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-6 py-8">
    <MessageList />
    <div ref={bottomRef} />
</div>
  );
}
