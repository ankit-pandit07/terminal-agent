"use client"

import { getConversationMemory, getMemoryHistory, Memory } from "../api/memory.api"
import {useState,useCallback,useEffect} from "react";

export function useMemory(conversationId?:string){
    const [memory,setMemory]=useState<Memory[]>([]);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState<string | null>(null);

    const refresh=useCallback(async()=>{
        setLoading(true);
        setError(null);

        try {
            const data=conversationId ? await getConversationMemory(conversationId):await getMemoryHistory();
            setMemory(data);

        } catch (error) {
            console.log("Failed to load memory:",error);

            setError("Failed to load memory.");
        }finally{
            setLoading(false);
        }
    },[conversationId]);

    useEffect(()=>{
        void refresh();
    },[refresh]);

    return {
        memory,
        loading,
        error,
        refresh
    }
}