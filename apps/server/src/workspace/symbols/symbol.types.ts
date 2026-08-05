export interface SymbolInfo {

    name: string;

    kind:
        | "class"
        | "function"
        | "interface"
        | "enum"
        | "type"
        | "variable";

    exported: boolean;

}

export interface FileSymbols {

    file: string;

    symbols: SymbolInfo[];

}