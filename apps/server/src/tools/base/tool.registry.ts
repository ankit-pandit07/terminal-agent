import type { Tool, ToolCategory } from "./tool.interface.js";

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return [...this.tools.values()];
  }

  exists(name: string): boolean {
    return this.tools.has(name);
  }

  list(): Tool[] {
    return [...this.tools.values()];
  }

  listByCategory(category: ToolCategory): Tool[] {
    return this.getAll().filter((tool) => tool.info.category === category);
  }

  enable(name: string): boolean {
    const tool = this.tools.get(name);

    if (!tool) {
      return false;
    }

    tool.info.enabled = true;
    return true;
  }

  disable(name: string): boolean {
    const tool = this.tools.get(name);

    if (!tool) {
      return false;
    }

    tool.info.enabled = false;
    return true;
  }

  enabledTools(): Tool[] {
    return this.getAll().filter((tool) => tool.info.enabled);
  }

  disabledTools(): Tool[] {
    return this.getAll().filter((tool) => !tool.info.enabled);
  }

  remove(name: string): boolean {
    return this.tools.delete(name);
  }

  clear(): void {
    this.tools.clear();
  }

  size(): number {
    return this.tools.size;
  }
}
