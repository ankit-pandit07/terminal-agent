import { ConversationRepository } from "../repositories/conversation.repository.js";

export class ConversationService {
  private repository = new ConversationRepository();

  async getHistory() {
    return this.repository.findAll();
  }

  async getRecent(limit = 10) {
    return this.repository.findRecent(limit);
  }

  async getConversation(id: string) {
    return this.repository.findById(id);
  }

  async deleteConversation(id: string) {
    return this.repository.delete(id);
  }
}