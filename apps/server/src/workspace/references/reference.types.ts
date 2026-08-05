export interface SymbolReference {
    symbol:string;
    file:string;
    line:number;
    column:number;
}

export interface ReferenceResult{
    symbol:string;
    references:SymbolReference[];
}