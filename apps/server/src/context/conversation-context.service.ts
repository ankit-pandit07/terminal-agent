import { Role } from "@prisma/client";
import { ConversationRepository } from "../repositories/conversation.repository.js";

export class ConversationContextService {
  private repository = new ConversationRepository();

  private readonly MAX_MESSAGES = 10;

  async build(conversationId: string): Promise<string> {
    const conversation = await this.repository.findById(conversationId);

    if (!conversation || conversation.messages.length === 0) {
      return "No previous conversation.";
    }

    const messages = conversation.messages.slice(-this.MAX_MESSAGES);

    const formatted = messages.map((message) => {
      let role = "Unknown";

      switch (message.role) {
        case Role.USER:
          role = "User";
          break;

        case Role.ASSISTANT:
          role = "Assistant";
          break;

        default:
          role = message.role;
      }

      return `${role}
--------------------------------
${message.content}`;
    });

    return `
==============================
Conversation Context
==============================

${formatted.join("\n\n")}
`;
  }
}