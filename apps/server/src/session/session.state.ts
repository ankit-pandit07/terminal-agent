export class SessionState{
    private currentDirectory = process.cwd();

private lastTool: string | undefined = undefined;
private lastError: string | undefined = undefined;

    private retryCount=0;
    
    private executedCommands:string[]=[];
    
    private modifiedFiles:string[]=[];
//current directory

    getCurrentDirectory():string{
        return this.currentDirectory;
    }
    setCurrentDirectory(path:string):void{
        this.currentDirectory=path;
    }
// Last tool
    getLastTool():string | undefined{
        return this.lastTool;
    }
    setLastTool(tool:string):void{
        this.lastTool=tool;
    }
// Last Error
    getLastError():string | undefined{
        return this.lastError;
    }
    setLastError(error:string):void{
        this.lastError=error;
    }
    clearLastError():void{
        this.lastError=undefined;
    }

// Retry Count
    getRetryCount():number{
        return this.retryCount;
    }
    incrementRetryCount():void{
        this.retryCount++;
    }
    resetRetryCount():void{
        this.retryCount=0;
    }

//Commands
    getExecutedCommands():string[]{
        return [...this.executedCommands];
    }

    addExecutedCommand(command:string):void{
        this.executedCommands.push(command);
    }
//Modified Files
    getModifiedFiles():string[]{
        return [...this.modifiedFiles];
    }

    addModifiedFile(file:string):void{
        if(!this.modifiedFiles.includes(file)){
            this.modifiedFiles.push(file);
        }
    }
//Reset Execution Memory
    reset():void{
        this.currentDirectory=process.cwd();

        this.lastTool=undefined;
        this.lastError=undefined;
        this.retryCount=0;
        this.executedCommands=[];
        this.modifiedFiles=[];
    }
    getSnapshot(){
        return {
            currentDirectory:this.currentDirectory,
            lastTool:this.lastTool,
            lastError:this.lastError,
            retryCount:this.retryCount,
            executedCommands:[...this.executedCommands],
            modifiedFiles:[...this.modifiedFiles]
        }
    }
}