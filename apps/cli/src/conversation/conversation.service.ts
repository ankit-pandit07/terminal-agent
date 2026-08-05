export class ConversationService {
  private readonly baseUrl = "http://localhost:5000";

  async getConversation(id: string) {
    const response = await fetch(`${this.baseUrl}/chat/conversations/${id}`);

    if (!response.ok) {
      throw new Error("Unable to load conversation.");
    }

    return response.json();
  }

  async getHistory() {
    const response = await fetch(`${this.baseUrl}/chat/conversations`);

    if (!response.ok) {
      throw new Error("Unable to load history.");
    }

    return response.json();
  }

  async deleteConversation(id: string) {
    const response = await fetch(`${this.baseUrl}/chat/conversations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Unable to delete conversation.");
    }

    return response.json();
  }
}
