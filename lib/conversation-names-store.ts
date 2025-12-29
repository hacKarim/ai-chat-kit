import { create } from "zustand";

interface ConversationNamesState {
  // Map conversation ID to name
  namesByConversationId: Map<string, string>;
  // Map thread key (first user message) to conversation ID and name
  conversationIdsByThreadKey: Map<string, string>;
  // Pending updates: threadKey -> name (for titles that need to be synced to assistant-ui)
  pendingUpdates: Map<string, string>;

  setConversationName: (conversationId: string, threadKey: string, name: string) => void;
  getNameByThreadKey: (threadKey: string) => string | undefined;
  getPendingUpdate: (threadKey: string) => string | undefined;
  clearPendingUpdate: (threadKey: string) => void;
}

export const useConversationNamesStore = create<ConversationNamesState>((set, get) => ({
  namesByConversationId: new Map(),
  conversationIdsByThreadKey: new Map(),
  pendingUpdates: new Map(),

  setConversationName: (conversationId: string, threadKey: string, name: string) => {
    set((state) => {
      const newNamesById = new Map(state.namesByConversationId);
      const newIdsByKey = new Map(state.conversationIdsByThreadKey);
      const newPendingUpdates = new Map(state.pendingUpdates);

      newNamesById.set(conversationId, name);
      newIdsByKey.set(threadKey, conversationId);
      newPendingUpdates.set(threadKey, name);

      return {
        namesByConversationId: newNamesById,
        conversationIdsByThreadKey: newIdsByKey,
        pendingUpdates: newPendingUpdates,
      };
    });
  },

  getNameByThreadKey: (threadKey: string) => {
    const conversationId = get().conversationIdsByThreadKey.get(threadKey);
    if (!conversationId) return undefined;
    return get().namesByConversationId.get(conversationId);
  },

  getPendingUpdate: (threadKey: string) => {
    return get().pendingUpdates.get(threadKey);
  },

  clearPendingUpdate: (threadKey: string) => {
    set((state) => {
      const newPendingUpdates = new Map(state.pendingUpdates);
      newPendingUpdates.delete(threadKey);
      return { pendingUpdates: newPendingUpdates };
    });
  },
}));

// Export store methods for non-React contexts
export const conversationNamesStore = {
  setConversationName: (conversationId: string, threadKey: string, name: string) => {
    useConversationNamesStore.getState().setConversationName(conversationId, threadKey, name);
  },
  getNameByThreadKey: (threadKey: string) => {
    return useConversationNamesStore.getState().getNameByThreadKey(threadKey);
  },
};
