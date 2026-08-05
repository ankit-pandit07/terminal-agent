import fs from "fs/promises"
import path from "path";
export interface ProjectFile {
    path :string;
    type:"file" | "directory";
}

export class FileScanner {
    async scan(
        root:string,
    ):Promise<ProjectFile[]>{
        const result: ProjectFile[] = [];
        await this.walk(root, root, result);

        return result
    }

    private async walk(
        root:string,
        current:string,
        result:ProjectFile[],
    ){
        const entries = await fs.readdir(current,{
            withFileTypes:true,
        });
        for(const entry of entries){
            if(entry.name === "node_modules" || 
            entry.name === ".git" || 
            entry.name === "dist"
        ){
            continue;
        }

        const absolute=path.join(current, entry.name);
        const relative=path.relative(root, absolute);

        if(entry.isDirectory()){
            result.push({
                path:relative,
                type:"directory"
            });

            await this.walk(root, absolute, result);
        }else{
            result.push({
                path:relative,
                type:"file",
            });
        }
        }
    }
}