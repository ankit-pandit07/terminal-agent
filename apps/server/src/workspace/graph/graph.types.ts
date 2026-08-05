export interface GraphNode{
    id:string;
    path:string;
    type:"file" | "directory";
}

export interface GraphEdge{
    from:string;
    to:string;
    relation:"contains" | "imports"
}

export interface ProjectGraph {
    nodes:GraphNode[];
    edges:GraphEdge[];
}