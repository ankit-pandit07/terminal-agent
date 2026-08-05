export interface CLICommand {
    name:string;
    description:string;
    execute(args?:string[]):Promise<void>
}