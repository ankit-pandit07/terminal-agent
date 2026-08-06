import type { FileTask } from "./multi-file.types.js";

export class DependencyResolver {
  resolve(files: FileTask[]): FileTask[] {
    return [...files].sort((a, b) => b.priority - a.priority);
  }
}
