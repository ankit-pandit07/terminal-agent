"use client";

import { useEffect, useState } from "react";
import { getConversation, getConversations } from "../api/conversation.api";
import { useConversationStore } from "../store/conversation.store";
import { useChatStore } from "../store/chat.store";

export function useConversations() {
  const setConversations = useConversationStore((s) => s.setConversations);
  const conversations = useConversationStore((s) => s.conversations);
  const [loading, setLoading] = useState(true);
  const setMessages=useChatStore((s)=>s.setMessages);

  async function refresh() {
    try {
      const data = await getConversations();

      setConversations(data);
    } finally {
      setLoading(false);
    }
  }

   async function openConversation(id:string){
    const conversation=await getConversation(id);

    setMessages(conversation.messages);
  }

  useEffect(() => {
    refresh();
  }, []);

  

  return {
    conversations,
    loading,
    refresh,
    openConversation
  };

 
}
