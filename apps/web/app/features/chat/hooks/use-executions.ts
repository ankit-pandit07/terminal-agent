import { Execution, getExecutions } from "../api/execution.api";
import {useState,useCallback,useEffect} from "react"

export function useExecutions(
    conversationId?:string
){
    const [executions, setExecutions]=useState<Execution[]>([]);
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState<string | null>(null);

    const refresh= useCallback(async()=>{
        if(!conversationId){
            setExecutions([]);
            return;
        }
        setLoading(true)
        setError(null)

        try {
            const data=await getExecutions(conversationId)
            setExecutions(data)
        } catch (error) {
            console.log("Failed to load executions:",error);

            setError("Failed to load executions.");
        }finally {
            setLoading(false);
        }
    },[conversationId]);

    useEffect(()=>{
        void refresh();
    },[refresh]);

    return {
        executions,
        loading,
        error,
        refresh
    }
}
