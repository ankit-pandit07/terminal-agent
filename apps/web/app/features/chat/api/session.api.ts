import { api } from "../../../../lib/api";

export interface SessionSnapshot {
    currentDirectory:string;
    lastTool:string | null;
    lastError:string | null;
    retryCount:number;

    executedCommands:string[];
    successfulCommands:string[];
    failedCommands:string[];

    modifiedFiles:string[];
    visitedDirectories:string[];
    recoveryHistory: string[];
}

export async function getSession(){
    const {data}=await api.get<{
        success:boolean;
        session:SessionSnapshot;
    }>("/chat/session");

    return data.session;
}