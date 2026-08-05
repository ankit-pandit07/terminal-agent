import ts from "typescript";

export interface ASTFile {
    path: string;
    sourceFile: ts.SourceFile;

}