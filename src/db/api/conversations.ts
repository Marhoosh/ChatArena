import { Database } from "../types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];
type ConversationUpdate = Database["public"]["Tables"]["conversations"]["Update"];

export const conversationQueries = {
  getConversationsByBotId: async (botId: string, userId: string) => {
    console.log('[Mock] getConversationsByBotId called with:', { botId, userId });
    return { data: [], error: null };
  },

  getConversationById: async (conversationId: string) => {
    console.log('[Mock] getConversationById called with:', { conversationId });
    return { data: null, error: null };
  }
};

export const conversationMutations = {
  createConversation: async (conversation: ConversationInsert) => {
    console.log('[Mock] createConversation called with:', conversation);
    return { data: null, error: null };
  },

  updateConversation: async (conversationId: string, updates: ConversationUpdate) => {
    console.log('[Mock] updateConversation called with:', { conversationId, updates });
    return { data: null, error: null };
  },

  deleteConversation: async (conversationId: string) => {
    console.log('[Mock] deleteConversation called with:', { conversationId });
    return { error: null };
  }
};
