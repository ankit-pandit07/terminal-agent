"use client";

import { useChatStore } from "../store/chat.store";
import { EventList } from "./event-list.";
import { MessageList } from "./message-list";
import { useEffect, useRef } from "react";

export function ChatWindow() {
  const messages = useChatStore((s) => s.messages);

  const events = useChatStore((s) => s.events);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, events]);

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto px-6 py-8">
      <EventList />

      <MessageList />

      <div ref={bottomRef} />
    </div>
  );
}
