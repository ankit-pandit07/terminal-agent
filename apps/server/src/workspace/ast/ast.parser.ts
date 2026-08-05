import fs from "fs/promises";
import ts from "typescript";

import type { ASTFile } from "./ast.types.js";

export class ASTParser {

    async parse(
        file: string,
    ): Promise<ASTFile> {

        const source = await fs.readFile(
            file,
            "utf8",
        );

        const sourceFile = ts.createSourceFile(

            file,

            source,

            ts.ScriptTarget.Latest,

            true,

            ts.ScriptKind.TS,

        );

        return {

            path: file,

            sourceFile,

        };

    }

}