export interface WorkspaceReader<T>{
    read(root:string):Promise<T | null>;
}