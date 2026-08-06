import type {
  Tool,
  ToolCategory,
  ToolInput,
  ToolOutput,
} from "./base/tool.interface.js";
import type { ToolRegistry } from "./base/tool.registry.js";

export class ToolService {
  constructor(private readonly registry: ToolRegistry) {}

  getAll(): Tool[] {
    return this.registry.list();
  }

  get(name: string): Tool | undefined {
    return this.registry.get(name);
  }

  exits(name: string): boolean {
    return this.registry.exists(name);
  }

  enable(name: string): boolean {
    return this.registry.enable(name);
  }

  disable(name: string): boolean {
    return this.registry.disable(name);
  }

  getEnabled(): Tool[] {
    return this.registry.enabledTools();
  }

  getDisabled(): Tool[] {
    return this.registry.disabledTools();
  }

  getByCategory(category: ToolCategory): Tool[] {
    return this.registry.listByCategory(category);
  }

  size(): number {
    return this.registry.size();
  }

  async execute(name: string, input: ToolInput): Promise<ToolOutput> {
    const tool = this.get(name);

    if (!tool) {
      throw new Error(`Tool '${name}' not found.`);
    }

    if (!tool.info.enabled) {
      throw new Error(`Tool '${name}' is disabled.`);
    }

    return tool.execute(input);
  }
}
