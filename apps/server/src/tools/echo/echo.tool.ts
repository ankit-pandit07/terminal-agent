import type{Tool, ToolInput, ToolOutput} from "../base/tool.interface.js"

export class EchoTool implements Tool{
    name="echo";

    description="Returns the same message.";

    async execute(input: ToolInput): Promise<ToolOutput> {
        return {
            success:true,
            data:input.message
        };
    }
}