export interface CLICommand {
    name:string;
    description:string;
    execute():Promise<void>
}