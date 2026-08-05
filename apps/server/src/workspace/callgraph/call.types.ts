export interface CallEdge {
  caller: string;
  callee: string;
  file: string;
  line: number;
}

export interface CallGraph {
  edges: CallEdge[];
}