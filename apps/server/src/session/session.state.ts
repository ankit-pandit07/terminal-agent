export class SessionState{
    private currentDirectory = process.cwd();

    getCurrentDirectory(){
        return this.currentDirectory;
    }
    setCurrentDirectory(path:string){
        this.currentDirectory=path;
    }
}