import { create } from "zustand";
import type { Conversation } from "../api/conversation.api";

interface ConversationStore {
  conversations: Conversation[];
  selectedConversationId: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  setConversations: (items: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversationTimestamp: (id: string, timestamp?: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  selectConversation: (id: string | null) => void;
  removeConversation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

function sortByUpdatedAt(items: Conversation[]): Conversation[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  selectedConversationId: null,
  loading: false,
  error: null,
  initialized: false,

  setConversations: (items) =>
    set({
      conversations: sortByUpdatedAt(items),
      initialized: true,
      error: null,
    }),

  addConversation: (conversation) =>
    set((state) => {
      const filtered = state.conversations.filter(
        (item) => item.id !== conversation.id
      );
      const updatedList = [conversation, ...filtered];
      return {
        conversations: sortByUpdatedAt(updatedList),
      };
    }),

  updateConversationTimestamp: (id, timestamp) =>
    set((state) => {
      const now = timestamp || new Date().toISOString();
      const updatedList = state.conversations.map((item) =>
        item.id === id ? { ...item, updatedAt: now } : item
      );
      return {
        conversations: sortByUpdatedAt(updatedList),
      };
    }),

  updateConversationTitle: (id, title) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.id === id ? { ...item, title } : item
      ),
    })),

  selectConversation: (id) =>
    set({
      selectedConversationId: id,
    }),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (conversation) => conversation.id !== id
      ),
      selectedConversationId:
        state.selectedConversationId === id
          ? null
          : state.selectedConversationId,
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  clearSelection: () =>
    set({
      selectedConversationId: null,
    }),

  reset: () =>
    set({
      conversations: [],
      selectedConversationId: null,
      loading: false,
      error: null,
      initialized: false,
    }),
}));