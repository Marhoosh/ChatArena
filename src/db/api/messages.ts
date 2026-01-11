import { Database } from "../types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export const messageQueries = {
  getMessagesByConversationId: async (conversationId: string) => {
    console.log('[Mock] getMessagesByConversationId called with:', { conversationId });
    return { data: [], error: null };
  },

  getMessageById: async (messageId: string) => {
    console.log('[Mock] getMessageById called with:', { messageId });
    return { data: null, error: null };
  }
};

export const messageMutations = {
  createMessage: async (message: MessageInsert) => {
    console.log('[Mock] createMessage called with:', message);
    return { data: null, error: null };
  },

  updateMessage: async (messageId: string, updates: MessageUpdate) => {
    console.log('[Mock] updateMessage called with:', { messageId, updates });
    return { data: null, error: null };
  },

  deleteMessage: async (messageId: string) => {
    console.log('[Mock] deleteMessage called with:', { messageId });
    return { error: null };
  },

  deleteMessagesByConversationId: async (conversationId: string) => {
    console.log('[Mock] deleteMessagesByConversationId called with:', { conversationId });
    return { error: null };
  }
};
