import { Execution, getExecution } from "../api/execution.api";
import {useState,useCallback,useEffect} from "react";

export function useExecution(
    executionId?:string
){
    const [execution,setExecution]=useState<Execution | null>(null);
    const [loading, setLoading]=useState(false);

    const [error, setError]=useState<string | null>(null);
    const refresh=useCallback(async ()=>{
        if(!executionId){
            setExecution(null);
            return;
        }
        setLoading(true);
        setError(null);

        try{
            const data=await getExecution(executionId);
            setExecution(data);
        }catch(error){
            console.log("Failed to load execution:",error);

            setError("Failed to load execution.")
        }finally{
            setLoading(false);
        }
    },[executionId]);

    useEffect(()=>{
        void refresh();
    },[refresh]);

    return {
        execution,
        loading,
        error,
        refresh,
    }
}