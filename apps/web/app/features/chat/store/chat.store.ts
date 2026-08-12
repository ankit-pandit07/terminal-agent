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
  setMessages: (messages: Message[]) => void;

  events: StreamEvent[];
  addEvent: (event: StreamEvent) => void;
  setEvents: (events: StreamEvent[]) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  conversationId?: string;
  setConversationId: (id: string) => void;

  confirmationId?: string;
  confirmationMessage?: string;

  setConfirmation: (id: string, message: string) => void;

  clearConfirmation: () => void;

  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],

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

  setMessages: (messages) =>
    set({
      messages,
    }),

  events: [],

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  setEvents: (events) =>
    set({
      events,
    }),

  loading: false,

  setLoading: (loading) =>
    set({
      loading,
    }),

  conversationId: undefined,

  setConversationId: (id) =>
    set({
      conversationId: id,
    }),

  confirmationId: undefined,

  confirmationMessage: undefined,

  setConfirmation: (id, message) =>
    set({
      confirmationId: id,
      confirmationMessage: message,
    }),

  clearConfirmation: () =>
    set({
      confirmationId: undefined,
      confirmationMessage: undefined,
    }),

  clear: () =>
    set({
      messages: [],
      events: [],
      loading: false,
      conversationId: undefined,
      confirmationId: undefined,
      confirmationMessage: undefined,
    }),
}));
