import type{Tool} from "./tool.interface.js"

export class ToolRegistry {
    private tools=new Map<string,Tool>();

    register(tool: Tool){
        this.tools.set(tool.name, tool);
    }

    get(name:string):Tool | undefined {
        return this.tools.get(name)
    }

    getAll(){
        return [...this.tools.values()];
    }
}
