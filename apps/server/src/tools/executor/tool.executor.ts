import type { ToolInput } from "../base/tool.interface.js";
import type { ToolRegistry } from "../base/tool.registry.js";

export class ToolExecutor {
  constructor(private registry: ToolRegistry) {}

  async execute(
    toolName: string,

    input: ToolInput,
  ) {
    const tool = this.registry.get(toolName);

    if (!tool) {
      throw new Error(`Tool '${toolName}' not found.`);
    }

    return tool.execute(input);
  }
}
