"use client";
import {useState} from "react";
import { useChat } from "../hooks/use-chat";

export function ChatInput(){
    const [value, setValue]=useState("");
    const {send,stream,loading}=useChat();

    async function onSubmit(e:React.FormEvent){
        e.preventDefault();

        if(!value.trim()) return;

        await send(value);
        await stream(value);
        

        setValue("");
    }
    return (
        <form onSubmit={onSubmit}>
            <input 
            value={value}
            onChange={(e)=>setValue(e.target.value)}/>
            <button disabled={loading}>
                Send
            </button>
        </form>
    )
}