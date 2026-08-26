import type { Plan } from "../planner/planner.js";

export interface PendingConfirmation {
  id: string;
  userId?: string | undefined;
  executionId: string;
  conversationId: string;
  plan: Plan;
  message: string;
  createdAt: Date;
}