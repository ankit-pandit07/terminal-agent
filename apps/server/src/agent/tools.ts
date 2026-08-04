import { ExecutorService } from "../executor/executor.service.js";
import type { ToolCategory } from "../tools/base/tool.interface.js";

const executor = new ExecutorService();

export function getTools() {
  return executor.getToolService().getAll();
}

export function getTool(name: string) {
  return executor.getToolService().get(name);
}

export function enableTool(name: string) {
  return executor.getToolService().enable(name);
}

export function disableTool(name: string) {
  return executor.getToolService().disable(name);
}

export function getToolsByCategory(category: ToolCategory) {
  return executor.getToolService().getByCategory(category);
}