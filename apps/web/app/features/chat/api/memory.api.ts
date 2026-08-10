import { api } from "../../../../lib/api";

export interface Memory{
    id:string;
    conversationId?:string | null;
    executionId?:string | null;
    type:string;
    key:string;
    value:string;
    createdAt:string;
}

export async function getMemoryHistory(){
    const {data}=await api.get<{
        success:boolean;
        memory:Memory[];
    }>("/chat/memory");

    return data.memory;
}

export async function getConversationMemory(
    conversationId:string,
){
    const {data}=await api.get<{
        success:boolean,
        memory:Memory[];
    }>(`/chat/memory/conversation/${conversationId}`);

    return data.memory;
}