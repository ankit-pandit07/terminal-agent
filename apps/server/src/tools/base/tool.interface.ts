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

export interface ToolOutput {
    success:boolean;
    data:unknown;

    metadata?:ToolMetadata;
}

export interface Tool {
    name:string;
    description:string;

    execute(input:ToolInput):Promise<ToolOutput>;
}