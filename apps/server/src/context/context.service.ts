import { MessageRepository } from "../repositories/message.repository.js";

export class ContextService {
  private messageRepository = new MessageRepository();

  // Future configurable values
  private readonly MAX_MESSAGES = 20;
  private readonly RECENT_MESSAGES = 10;

  async buildContext(conversationId: string): Promise<string> {
    const messages = await this.messageRepository.findByConversation(
      conversationId,
    );

    // Small conversations → return everything
    if (messages.length <= this.MAX_MESSAGES) {
      return messages
        .map((message) => `${message.role}: ${message.content}`)
        .join("\n");
    }

    // Large conversations → compress
    const recent = messages.slice(-this.RECENT_MESSAGES);

    return [
      "... Previous conversation omitted for brevity ...",
      "",
      ...recent.map(
        (message) => `${message.role}: ${message.content}`,
      ),
    ].join("\n");
  }
}