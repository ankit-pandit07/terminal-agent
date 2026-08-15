import { api } from "../../../../lib/api";

export interface ToolInfo {
    name:string;
    displayName:string;
    description:string;
    category:string;
    version:string;
    author:string;
    enabled:boolean;
    capabilities:string[]
}

export interface Tool{
    name:string;
    description:string;
    info:ToolInfo
}

export async function getTools(){
    const {data}=await api.get<{
        success:boolean;
        total:number;
        tools:Tool[];
    }>("/tools");

    return data.tools;
}

export async function getTool(name: string) {
  const { data } = await api.get<{
    success: boolean;
    tool: Tool;
  }>(`/tools/${name}`);
  return data.tool;
}

export async function enableTool(name: string) {
  const { data } = await api.patch(`/tools/${name}/enable`);
  return data;
}

export async function disableTool(name: string) {
  const { data } = await api.patch(`/tools/${name}/disable`);
  return data;
}