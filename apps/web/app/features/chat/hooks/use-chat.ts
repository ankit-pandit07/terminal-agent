"use client"
import {useState} from "react"
import { useChatStore } from "../store/chat.store";
import { sendMessage } from "../api/chat.api";
import { streamChat } from "../api/chat.stream";

export function useChat(){
    const [loading, setLoading]=useState(false);

    const addUserMessage=useChatStore((s)=>s.addUserMessage);

    const addAssistantMessage=useChatStore((s)=>s.addAssistantMessage);

    async function send(message:string){
        setLoading(true);
        
        try {
            addUserMessage(message);
            
            const response=await sendMessage({
                message,
            })
            addAssistantMessage(
                response.response ?? JSON.stringify(response),
            );
        } finally {
            setLoading(false);
            
        }

        
    }

    const addEvent=useChatStore((s)=>s.addEvent);

    async function stream(
        message:string,
    ){
        setLoading(true);
        addUserMessage(message);

        try{
            await streamChat(
                { message },
                (event)=>{
                addEvent(event);

                if(event.type === "completed"){
                    addAssistantMessage(String(event.response));
                }
            })
        }finally{
            setLoading(false);
        }
    }

    return {
        loading,
        send,
        stream
    }
}