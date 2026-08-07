import { ExecutionStatus } from "@prisma/client";
import { ExecutionRepository } from "../repositories/execution.repository.js";

export class ExecutionApplication {

  private repository = new ExecutionRepository();

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByConversation(
    conversationId: string,
  ) {
    return this.repository.findByConversation(
      conversationId,
    );
  }

  async updateStatus(
    id: string,
    status: ExecutionStatus,
  ) {
    return this.repository.updateStatus(
      id,
      status,
    );
  }

  async deleteConversationExecutions(
    conversationId: string,
  ) {
    return this.repository.deleteByConversation(
      conversationId,
    );
  }

}