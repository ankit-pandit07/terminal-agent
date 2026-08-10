import { api } from "../../../../lib/api";

export interface ToolExecution{
    id:string;
    tool:string;
    input:string;
    output:string;
    success:boolean;
    createdAt:string
}

export interface Execution{
    id:string;
    conversationId:string;
    goal:string;
    status:string;
    startedAt:string;
    finishedAt?:string | null;
    toolExecutions:ToolExecution[];
}

export async function getExecutions(
    conversationId:string
){
    const {data}=await api.get<Execution[]>(
        `/chat/executions/${conversationId}`
    );
    return data;
}

export async function getExecution(executionId:string){
    const {data}=await api.get<Execution>(
        `/chat/executions/detail/${executionId}`
    )
    return data;
}