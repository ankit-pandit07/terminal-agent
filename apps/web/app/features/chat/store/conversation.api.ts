import { api } from "../../../../lib/api";

export async function getConversations(){
    const {data} = await api.get("/chat/conversations");
    return data;
}

export async function getConversation(id:string){
    const {data}=await api.get(`/chat/conversations/${id}`)
    return data;
}

export async function deleteConverstion(id:string){
    await api.delete(`/chat/conversations/${id}`)
}