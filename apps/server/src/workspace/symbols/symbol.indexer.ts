import path from "path";

import { SymbolParser } from "./symbol.parser.js";

import type { ProjectFile } from "../indexer/file.scanner.js";

import type { FileSymbols } from "./symbol.types.js";

export class SymbolIndexer {

    private parser = new SymbolParser();

    async index(
        root: string,
        files: ProjectFile[],
    ): Promise<FileSymbols[]> {

        const result: FileSymbols[] = [];

        for (const file of files) {

            if (file.type !== "file") {
                continue;
            }

            if (!file.path.endsWith(".ts")) {
                continue;
            }

            const symbols = await this.parser.parse(
                path.join(root, file.path),
            );

            result.push({

                file: file.path,

                symbols,

            });

        }

        return result;

    }

}