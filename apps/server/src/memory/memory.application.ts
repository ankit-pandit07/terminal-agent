import { MemoryService } from "./memory.service.js";

export class MemoryApplication {
  private memory = new MemoryService();

  async history() {
    return this.memory.history();
  }

  async search(options: any) {
    return this.memory.search(options);
  }
}
