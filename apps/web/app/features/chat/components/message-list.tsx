"use client";

import { useChat } from "../hooks/use-chat";
import { useChatStore } from "../store/chat.store";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
   const loading = useChatStore((s) => s.loading);
   
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Start a conversation with your AI Agent 
      </div>
    );
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
