import { ConversationSession } from "./conversation.types.js";

export class ConversationManager {
    private session:ConversationSession={};

    getConversationId(): string | undefined {
        return this.session.conversationId
    }

    setConversationId(id:string): void {
        this.session.conversationId=id;
    }

    hasConversation(): boolean {
        return this.session.conversationId !== undefined;
    }

    clear(): void {
        this.session={};
    }

    getSession(): ConversationSession{
        return {
            ...this.session
        }
    }
}