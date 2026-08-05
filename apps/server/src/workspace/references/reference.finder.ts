import type { SymbolReference } from "./reference.types.js";
import fs from "fs/promises"
import ts from "typescript"

export class ReferenceFinder{
    async find(
        file:string,
        symbol:string,
    ):Promise<SymbolReference[]>{
        const source=await fs.readFile(file,"utf-8");

        const ast=ts.createSourceFile(
            file,
            source,
            ts.ScriptTarget.Latest,
            true,
        );

        const references:SymbolReference[]=[];

        function visit(node:ts.Node){
            if(ts.isIdentifier(node) && node.text === symbol){
                const position=ast.getLineAndCharacterOfPosition(node.getStart())

                references.push({
                    symbol,
                    file,
                    line:position.line + 1,
                    column:position.character + 1,
                })
            }
            ts.forEachChild(node,visit);
        }
        visit(ast);

        return references;
    }
}