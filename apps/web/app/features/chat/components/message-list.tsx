"use client";

import { useChatStore } from "../store/chat.store";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const loading = useChatStore((s) => s.loading);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {loading && <TypingIndicator />}
    </div>
  );
}
