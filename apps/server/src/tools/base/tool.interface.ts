export interface ToolInput {
    [key:string]:unknown;
}

export interface ToolMetadata {
    duration?:number;
    exitCode?:number;
    stdout?:string;
    stderr?:string;
    
    filesCreated?:string[];
    filesModified?:string[];
    filesDeleted?:string[];

    command?:string;
    cwd?:string;
}

export type ToolCategory=
| "system"
| "filesystem"
| "search"
| "network"
| "database"
| "utility";

export interface ToolInfo {
    name:string;
    displayName:string;
    description:string;
    category:ToolCategory;

    version:string;
    author:string;

    enabled:boolean;
    capabilities:readonly string[];
}

export interface ToolOutput {
    success:boolean;
    data:unknown;

    metadata?:ToolMetadata;
}

export interface Tool {
    name:string;
    description:string;
    info:ToolInfo;


    execute(input:ToolInput):Promise<ToolOutput>;
}