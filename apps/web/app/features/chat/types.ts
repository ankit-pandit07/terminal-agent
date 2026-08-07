export interface ChatMessage{
    id:string;
    role:"user" | "assistant";
    content:string;
    createdAt:string;
}

export interface ChatState{
    messages:ChatMessage[];
    loading:boolean;
    conversationId?:string;
}