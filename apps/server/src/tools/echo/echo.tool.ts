import type{Tool, ToolInfo, ToolInput, ToolOutput} from "../base/tool.interface.js"

export class EchoTool implements Tool{
    name="echo";
readonly info:ToolInfo = {
  name: "echo",
  displayName: "Echo",
  description: "Echo input back to the caller",

  category: "utility",

  version: "1.0.0",
  author: "NodeBase",

  enabled: true,

  capabilities: [
    "echo",
  ],
};
    description="Returns the same message.";

    async execute(input: ToolInput): Promise<ToolOutput> {
        return {
            success:true,
            data:input.message
        };
    }
}