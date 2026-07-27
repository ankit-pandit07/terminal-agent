export interface ToolInput {
    [key:string]:unknown;
}

export interface ToolOutput {
    success:boolean;
    data:unknown;
}

export interface Tool {
    name:string;
    description:string;

    execute(input:ToolInput):Promise<ToolOutput>;
}