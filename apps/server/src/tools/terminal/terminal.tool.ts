import {execa} from "execa"
import type{Tool, ToolInput, ToolOutput} from "../base/tool.interface.js"

export class TerminalTool implements Tool {
    name="terminal";

    description="Execute terminal commands."

    async execute(input: ToolInput): Promise<ToolOutput> {
        const command=String(input.command);

        try{
            const {stdout}=await execa(command,{
                shell:true,
            });

            return {
                success:true,
                data:stdout
            };
        }catch(error:any){
            return{
                success:false,
                data:error.message,
            }
        }
    }
}