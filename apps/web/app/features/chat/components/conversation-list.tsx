"use client";

import { useConversations } from "../hooks/use-conversation";
import { useConversationStore } from "../store/conversation.store";
import { ConversationItem } from "./conversation-item";


export function ConversationList() {
  const {loading}=useConversations();

  const conversations=useConversationStore((s)=>s.conversations);
  const selected=useConversationStore((s)=>s.selectedConversationId);
  const select=useConversationStore((s)=>s.selectedConversation);


  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          id={conversation.id}
          title={conversation.title}
          active={selected === conversation.id}
          onClick={()=>select(conversation.id)}
        />
      ))}
    </div>
  );
}