import path from "node:path"

export class SessionState{
    private currentDirectory=process.cwd();

    getCurrentDirectory(){
        return this.currentDirectory;
    }
    changeDirectory(target:string){
        this.currentDirectory=path.resolve(
            this.currentDirectory,
            target
        )
    }
    reset(){
        this.currentDirectory=process.cwd();
    }
}