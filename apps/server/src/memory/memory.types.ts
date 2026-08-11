export type MemoryType =
  "conversation" | "execution" | "tool" | "patch" | "rollback" | "workspace";

export interface MemoryRecord {
  id: string;

  conversationId?: string | null;
  executionId?: string | null;
  type: MemoryType;
  key: string;
  value: string;
  createdAt: Date;
}

export interface CreateMemoryInput {
  conversationId?: string;
  executionId?: string;
  type: MemoryType;
  key: string;
  value: string;
}

export interface MemorySearchOptions {
  conversationId?: string;
  executionId?: string;
  type?: MemoryType;
  query?: string;
  key?: string;
}
