import { ConversationService } from "./conversation.service.js";

const service = new ConversationService();

export async function history() {
  const conversations = await service.getHistory();

  return {
    success: true,
    history: conversations,
  };
}