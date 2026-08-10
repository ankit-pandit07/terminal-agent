import { create } from "zustand";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationStore {
  conversations: Conversation[];
  selectedConversationId?: string;

  setConversations: (items: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  selectConversation: (id: string) => void;
  removeConversation: (id: string) => void;
  clearSelection: () => void;
}

export const useConversationStore =
  create<ConversationStore>((set) => ({
    conversations: [],

    selectedConversationId: undefined,

    setConversations: (items) =>
      set({
        conversations: items,
      }),

    addConversation: (conversation) =>
      set((state) => ({
        conversations: [
          conversation,
          ...state.conversations.filter(
            (item) => item.id !== conversation.id
          ),
        ],
      })),

    selectConversation: (id) =>
      set({
        selectedConversationId: id,
      }),

    removeConversation: (id) =>
      set((state) => ({
        conversations:
          state.conversations.filter(
            (conversation) =>
              conversation.id !== id
          ),
      })),

    clearSelection: () =>
      set({
        selectedConversationId: undefined,
      }),
  }));