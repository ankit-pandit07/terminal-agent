import type { Tool, ToolInput, ToolOutput } from "../base/tool.interface.js";
import path from "path";
import { promises as fs } from "fs";
export class DirectoryTool implements Tool{
    name="directory";
    description="Browse directories and list files.";

    async execute(input: ToolInput): Promise<ToolOutput> {
        const action=String(input.action);

        switch(action){
            case "list":
                return this.list(String(input.path));

                case "tree":
                    return this.tree(String(input.path));

                    default:
                        return{
                            success:true,
                            data:"Unknown action",
                        }
        }
    }
private async list(dir:string):Promise<ToolOutput>{
    try {
        const items=await fs.readdir(dir,{
            withFileTypes:true,
        });

        const result=items.map((item)=>({
            name:item.name,
            type:item.isDirectory()?"directory":"file",
        }))

        return {
            success:true,
            data:result
        }
    } catch (err:any) {
        return {
            success:false,
            data:err.message,
        }
        
    }
}

private async tree(
    dir:string,
    prefix="",
):Promise<ToolOutput>{
    try{
        const output=await this.buildTree(dir,prefix);
        return {
            success:true,
            data:output,
        };
    }catch(err:any){
        return{
            success:false,
            data:err.message,
        }
    }
}

private async buildTree(
    dir:string,
    prefix:string
):Promise<string>{
    const entries=await fs.readdir(dir,{
        withFileTypes:true,
    });

    let result="";

    for(const entry of entries){
        result += `${prefix}${entry.name}\n`;

        if(entry.isDirectory()){
            result +=await this.buildTree(
                path.join(dir,entry.name),
                prefix + " "
            );
        }
    }

    return result;
}
}