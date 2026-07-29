import { execa } from "execa";
import type { Tool, ToolInput, ToolOutput } from "../base/tool.interface.js";
import path from "node:path";
import { SessionState } from "../../session/session.state.js";


export class TerminalTool implements Tool {
  name = "terminal";

  description = "Execute terminal commands.";
 constructor(private session: SessionState) {}
  async execute(input: ToolInput): Promise<ToolOutput> {
    const command = String(input.command);
    const cwd = this.session.getCurrentDirectory();
    try {
        //Handle cd command manually
        if(command.startsWith("cd")){
            const target = command.slice(3).trim();

            const newPath=path.resolve(cwd, target);

            this.session.setCurrentDirectory(newPath)

            return{
                success:true,
                data:`Changed directory to ${newPath}`
            }
        }

        //Handle pwd command 
        if(command==="pwd"){
            return{
                success:true,
                data:this.session.getCurrentDirectory(),
            }
        }
      const { stdout } = await execa(command, {
        shell: true,
        cwd,
      });

      return {
        success: true,
        data: stdout,
      };
    } catch (error: any) {
      return {
        success: false,
        data: error.message,
      };
    }
  }
}
