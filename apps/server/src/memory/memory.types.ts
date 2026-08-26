export type MemoryType =
  "conversation" | "execution" | "tool" | "patch" | "rollback" | "workspace";

export interface MemoryRecord {
  id: string;
  userId?: string | null;
  conversationId?: string | null;
  executionId?: string | null;
  type: MemoryType;
  key: string;
  value: string;
  createdAt: Date;
}

export interface CreateMemoryInput {
  userId?: string | undefined;
  conversationId?: string | undefined;
  executionId?: string | undefined;
  type: MemoryType;
  key: string;
  value: string;
}

export interface MemorySearchOptions {
  userId?: string | undefined;
  conversationId?: string | undefined;
  executionId?: string | undefined;
  type?: MemoryType | undefined;
  query?: string | undefined;
  key?: string | undefined;
}
