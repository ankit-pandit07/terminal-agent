import { directoryDefinition } from "./directory.definition.js";
import { fileDefinition } from "./file.definition.js";
import { searchDefinition } from "./search.definition.js";
import { terminalDefinition } from "./terminal.definition.js";

export * from "./tool.definition.js";
export * from "./terminal.definition.js";

export const toolDefinitions=[
    terminalDefinition,
    fileDefinition,
    directoryDefinition,
    searchDefinition
]