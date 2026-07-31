export interface Observation {
    success: boolean;

    tool:string;

  category:
    | "terminal"
    | "file"
    | "directory"
    | "search"
    | "echo"
    | "unknown";

    summary:string;
    facts:string[];
    errors:string[];
    timestamp:Date;
}