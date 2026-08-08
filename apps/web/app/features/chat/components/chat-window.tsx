"use client"
import { useChatStore } from "../store/chat.store";
import { MessageList } from "./message-list";
import { useEffect, useRef } from "react";

export function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <div className="flex-1 overflow-auto p-6">
      <MessageList />
      <div ref={bottomRef} />
    </div>
  );
}
