import { ConversationStorage } from "./conversation.storage.js";
import { ConversationSession } from "./conversation.types.js";

export class ConversationManager {
  private storage = new ConversationStorage();

  private session: ConversationSession;

  constructor() {
    this.session = this.storage.load();
  }

  getConversationId(): string | undefined {
    return this.session.conversationId;
  }

  setConversationId(id: string): void {
    this.session.conversationId = id;

    // Persist immediately
    this.storage.save(this.session);
  }

  hasConversation(): boolean {
    return this.session.conversationId !== undefined;
  }

  clear(): void {
    this.session = {};

    this.storage.clear();
  }

  getSession(): ConversationSession {
    return {
      ...this.session,
    };
  }
}
