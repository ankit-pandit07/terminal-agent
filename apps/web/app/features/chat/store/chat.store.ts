import { create } from "zustand";
import { StreamEvent } from "../api/chat.stream";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatStore {
  messages: Message[];
  addUserMessage: (text: string) => void;
  addAssistantMessage: (text: string) => void;

  events: StreamEvent[];

  addEvent: (event: StreamEvent) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],

  
  events: [],

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),


  addUserMessage: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
        },
      ],
    })),

  addAssistantMessage: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: text,
        },
      ],
    })),

  clear: () =>
    set({
      messages: [],
    }),
}));
