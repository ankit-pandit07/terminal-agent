"use client";

import { getWorkspace, WorkspaceInfo } from "../api/workspace.api";
import {useState,useEffect} from "react";

export function useWorkspace(){
    const [workspace, setWorkspace]=useState<WorkspaceInfo | null>(null);
    const [loading,setLoading]=useState(true);
    
    const [error, setError]=useState<string | null>(null);

    useEffect(()=>{
        async function loadWorkspace(){
            try{
                setLoading(true);
                setError(null);

                const data=await getWorkspace();

                setWorkspace(data);
            }catch(error){
                console.log("Failed to load workspace.")
            }finally{
                setLoading(false)
            }
        }
        void loadWorkspace();
    },[]);

    return {
        workspace,
        loading,
        error
    }
}