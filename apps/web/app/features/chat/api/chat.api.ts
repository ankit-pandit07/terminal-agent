import { api } from "../../../../lib/api";

export interface ChatRequest{
    message:string;
    conversationId?:string
}

export async function sendMessage(
    body:ChatRequest,
){
    const {data}=await api.post("/chat",body);
    return data;
}