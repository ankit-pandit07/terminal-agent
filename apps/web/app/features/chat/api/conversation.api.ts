import { api } from "@/lib/api";
import type { ChatAttachment } from "../store/chat.store";

export interface ConversationMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
  createdAt?: string;
}

export interface Conversation {
  id: string;
  userId?: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: ConversationMessage[];
  executions?: unknown[];
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get("/chat/conversations");
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.history)) {
    return data.history;
  }
  return [];
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const { data } = await api.get(`/chat/conversations/${id}`);
  return data;
}

export async function deleteConversation(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/chat/conversations/${id}`);
  return data;
}