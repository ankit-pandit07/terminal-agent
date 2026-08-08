"use client";

import { useChatStore } from "../store/chat.store";
import { MessageItem } from "./message-item";

export function MessageList() {
  const messages = useChatStore((state) => state.messages);

  return (
    <>
     {messages.map((message)=>(
        <MessageItem 
        key={message.id}
        role={message.role}
        content={message.content}
        />
     ))}
    </>
  );
}
