import { api } from "../../../../lib/api";

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export async function sendMessage(body: ChatRequest) {
  const { data } = await api.post("/chat", body);

  return data;
}

export async function confirmAction(confirmationId: string) {
  const { data } = await api.post(`/chat/confirm/${confirmationId}`);

  return data;
}

export async function cancelAction(confirmationId: string) {
  const { data } = await api.post(`/chat/cancel/${confirmationId}`);

  return data;
}
