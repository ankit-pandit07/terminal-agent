import { ConversationContextService } from "./conversation-context.service.js";

export class ContextService {
  private conversationContext =
    new ConversationContextService();

  async buildContext(
    conversationId: string,
  ): Promise<string> {
    return this.conversationContext.build(
      conversationId,
    );
  }
}