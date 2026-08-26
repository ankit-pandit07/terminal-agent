import type { Plan } from "../planner/planner.js";
import type { PendingConfirmation } from "./confirmation.types.js";

export class ConfirmationService {
  private pending = new Map<string, PendingConfirmation>();

  create(
    executionId: string,
    conversationId: string,
    plan: Plan,
    message: string,
    userId?: string
  ): PendingConfirmation {
    const confirmation: PendingConfirmation = {
      id: crypto.randomUUID(),
      userId,
      executionId,
      conversationId,
      plan,
      message,
      createdAt: new Date(),
    };

    this.pending.set(confirmation.id, confirmation);

    return confirmation;
  }

  get(id: string): PendingConfirmation | undefined {
    return this.pending.get(id);
  }

  remove(id: string): boolean {
    return this.pending.delete(id);
  }

  confirm(id: string, userId?: string): PendingConfirmation | undefined {
    const confirmation = this.pending.get(id);

    if (!confirmation) {
      return undefined;
    }

    if (userId && confirmation.userId && confirmation.userId !== userId) {
      return undefined;
    }

    this.pending.delete(id);
    return confirmation;
  }

  cancel(id: string, userId?: string): boolean {
    const confirmation = this.pending.get(id);
    if (!confirmation) return false;

    if (userId && confirmation.userId && confirmation.userId !== userId) {
      return false;
    }

    return this.pending.delete(id);
  }
}
