import { MemoryRepository } from "./memory.repository.js";

export class MemoryService {

  private repository = new MemoryRepository();

  async saveConversation(
    conversationId: string,
    key: string,
    value: string,
  ) {
    return this.repository.create({
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
  ) {
    return this.repository.create({
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
  ) {
    return this.repository.create({
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
  ) {
    return this.repository.create({
      executionId,
      type: "patch",
      key: path,
      value: patch,
    });
  }

  async saveRollback(
    executionId: string,
    path: string,
  ) {
    return this.repository.create({
      executionId,
      type: "rollback",
      key: path,
      value: "rollback executed",
    });
  }

  async saveWorkspace(
    key: string,
    value: string,
  ) {
    return this.repository.create({
      type: "workspace",
      key,
      value,
    });
  }

  async history() {
    return this.repository.findRecent();
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
    conversationId:string,
  ){
    return this.repository.search({
      conversationId,
    })
  }
}