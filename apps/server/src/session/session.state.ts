export class SessionState {
  private currentDirectory = process.cwd();

  private lastTool: string | undefined = undefined;
  private lastError: string | undefined = undefined;

  private retryCount = 0;

  private executedCommands: string[] = [];

  private modifiedFiles: string[] = [];

  private successfulCommnads:string[]=[];

  private failedCommands:string[]=[];

  private visitedDirectories:string[]=[];

  private recoveryHistory:string[]=[];


  //current directory

  getCurrentDirectory(): string {
    return this.currentDirectory;
  }
  setCurrentDirectory(path: string): void {
    this.currentDirectory = path;
  }
  // Last tool
  getLastTool(): string | undefined {
    return this.lastTool;
  }
  setLastTool(tool: string): void {
    this.lastTool = tool;
  }
  // Last Error
  getLastError(): string | undefined {
    return this.lastError;
  }
  setLastError(error: string): void {
    this.lastError = error;
  }
  clearLastError(): void {
    this.lastError = undefined;
  }

  // Retry Count
  getRetryCount(): number {
    return this.retryCount;
  }
  incrementRetryCount(): void {
    this.retryCount++;
  }
  resetRetryCount(): void {
    this.retryCount = 0;
  }

  //Commands
  getExecutedCommands(): string[] {
    return [...this.executedCommands];
  }

  addExecutedCommand(command: string): void {
    this.executedCommands.push(command);
  }
  //Modified Files
  getModifiedFiles(): string[] {
    return [...this.modifiedFiles];
  }

  addModifiedFile(file: string): void {
    if (!this.modifiedFiles.includes(file)) {
      this.modifiedFiles.push(file);
    }
  }

  //Successful commands
  getSuccessfulCommands():string[]{
    return [...this.successfulCommnads];
  }
  
  addSuccessfulCommand(command:string):void{
    if(!this.successfulCommnads.includes(command)){
        this.successfulCommnads.push(command)
    }
  }

  //Failed commands
  getFailedCommands():string[]{
    return [...this.failedCommands]
  }

  addFailedCommand(command:string):void{
    if(!this.failedCommands.includes(command)){
        this.failedCommands.push(command)
    }
  }

  // visited directories
  getVisitedDirectories():string[]{
    return [...this.visitedDirectories];
  }

  addVisitedDirectory(path:string):void{
    if(!this.visitedDirectories.includes(path)){
        this.visitedDirectories.push(path)
    }
  }

  //Recovery History
  getRecoveryHistory():string[]{
    return [...this.recoveryHistory];
  }

  addRecovery(message:string):void{
    this.recoveryHistory.push(message);
  }
  //Reset Execution Memory
  reset(): void {
    this.currentDirectory = process.cwd();

    this.lastTool = undefined;
    this.lastError = undefined;
    this.retryCount = 0;
    this.executedCommands = [];
    this.modifiedFiles = [];
    this.successfulCommnads=[];
    this.failedCommands=[];
    this.visitedDirectories=[];
    this.recoveryHistory=[];
  }
  getSnapshot() {
    return {
      currentDirectory: this.currentDirectory,
      lastTool: this.lastTool,
      lastError: this.lastError,
      retryCount: this.retryCount,
      executedCommands: [...this.executedCommands],
      modifiedFiles: [...this.modifiedFiles],
    };
  }
}
