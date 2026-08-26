import { MemoryRepository } from "./memory.repository.js";

export class MemoryService {
  private repository = new MemoryRepository();

  async saveConversation(
    conversationId: string,
    key: string,
    value: string,
    userId?: string
  ) {
    return this.repository.create({
      userId,
      conversationId,
      type: "conversation",
      key,
      value,
    });
  }

  async saveExecution(
    executionId: string,
    key: string,
    value: string,
    userId?: string
  ) {
    return this.repository.create({
      userId,
      executionId,
      type: "execution",
      key,
      value,
    });
  }

  async saveToolExecution(
    executionId: string,
    tool: string,
    output: string,
    userId?: string
  ) {
    return this.repository.create({
      userId,
      executionId,
      type: "tool",
      key: tool,
      value: output,
    });
  }

  async savePatch(
    executionId: string,
    path: string,
    patch: string,
    userId?: string
  ) {
    return this.repository.create({
      userId,
      executionId,
      type: "patch",
      key: path,
      value: patch,
    });
  }

  async saveRollback(
    executionId: string,
    path: string,
    userId?: string
  ) {
    return this.repository.create({
      userId,
      executionId,
      type: "rollback",
      key: path,
      value: "rollback executed",
    });
  }

  async saveWorkspace(
    key: string,
    value: string,
    userId?: string
  ) {
    return this.repository.create({
      userId,
      type: "workspace",
      key,
      value,
    });
  }

  async history(userId?: string) {
    return this.repository.findRecent(20, userId);
  }

  async search(options: any) {
    return this.repository.search(options);
  }

  async clearConversation(
    conversationId: string,
  ) {
    return this.repository.clearConversation(
      conversationId,
    );
  }

  async getByConversation(
    conversationId: string,
    userId?: string
  ) {
    return this.repository.search({
      conversationId,
      userId,
    });
  }
}