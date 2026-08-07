import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatStore {
  messages: Message[];

  addMessage: (message: Message) => void;

  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clear: () =>
    set({
      messages: [],
    }),
}));
