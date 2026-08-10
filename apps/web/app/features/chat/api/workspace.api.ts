import { api } from "../../../../lib/api";

export interface WorkspaceInfo{
    projectName?:string;
    language:string;
    framework?:string;
    packageManager:string;
    orm?:string;
    hasGit:boolean;
    hasPrisma:boolean;
    dependencies:string[];
    scripts:Record<string,string>;
}

export async function getWorkspace(){
    const {data}=await api.get<{
        success:boolean;
        workspace:WorkspaceInfo;
    }>("/chat/workspace");

    return data.workspace;
}