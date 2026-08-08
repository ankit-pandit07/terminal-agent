import { api } from "../../../../lib/api";

export interface Conversation{
    id:string;
    title:string;
    createdAt:string;
    updatedAt:string;
}

export async function getConversations(){
    const {data}= await api.get("/chat/conversations");
    return data;
}

export async function getConversation(id:string){
    const {data}=await api.get(`/chat/conversations/${id}`)
    return data;
}
