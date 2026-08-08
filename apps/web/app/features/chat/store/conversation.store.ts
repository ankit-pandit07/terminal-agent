import { create } from "zustand";

export interface Conversation{
    id:string;
    title:string;
    createdAt:string;
    updatedAt:string;
}

interface ConversationStore{
    conversations:Conversation[];
    selectedConversationId?:string;
    setConversations:(items:Conversation[])=>void;
    selectedConversation:(id:string)=>void;
    removeConversation:(id:string)=>void;

    clearSelection:()=>void;

}

export const useConversationStore=create<ConversationStore>((set)=>({
    conversations:[],
    selectedConversationId:undefined,
    setConversations:(items)=>set({
        conversations:items,
    }),
    selectedConversation:(id)=>set({
        selectedConversationId:id,
    }),
    removeConversation:(id)=>set((state)=>({
        conversations:state.conversations.filter((c)=>c.id !== id)
    })),
    clearSelection:()=>set({
        selectedConversationId:undefined,
    })
}))