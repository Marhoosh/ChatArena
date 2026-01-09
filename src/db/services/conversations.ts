import { conversationQueries, conversationMutations } from "../api";
import { Database } from "../types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

export class ConversationService {
  async getConversationById(id: string): Promise<{ conversation: ConversationRow | null; error: Error | null }> {
    try {
      const { data, error } = await conversationQueries.getConversationById(id);

      return {
        conversation: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async getConversationsByUserId(userId: string, limit: number = 20): Promise<{ conversations: ConversationRow[]; error: Error | null }> {
    try {
      const { data, error } = await conversationQueries.getConversationsByUserId(userId, limit);

      return {
        conversations: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversations: [],
        error: error as Error,
      };
    }
  }

  async getConversationsByBotId(botId: string, limit: number = 20): Promise<{ conversations: ConversationRow[]; error: Error | null }> {
    try {
      const { data, error } = await conversationQueries.getConversationsByBotId(botId, limit);

      return {
        conversations: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversations: [],
        error: error as Error,
      };
    }
  }

  async getConversationsByUserAndBot(userId: string, botId: string, limit: number = 20): Promise<{ conversations: ConversationRow[]; error: Error | null }> {
    try {
      const { data, error } = await conversationQueries.getConversationsByUserAndBot(userId, botId, limit);

      return {
        conversations: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversations: [],
        error: error as Error,
      };
    }
  }

  async createConversation(
    botId: string,
    userId?: string,
    title?: string | null
  ): Promise<{ conversation: ConversationRow | null; error: Error | null }> {
    try {
      const { data, error } = await conversationMutations.createConversation(botId, userId, title);

      return {
        conversation: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async updateConversation(
    id: string,
    updates: Partial<Pick<ConversationRow, "title" | "user_id" | "bot_id">>
  ): Promise<{ conversation: ConversationRow | null; error: Error | null }> {
    try {
      const { data, error } = await conversationMutations.updateConversation(id, updates);

      return {
        conversation: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async updateConversationTitle(id: string, title: string): Promise<{ conversation: ConversationRow | null; error: Error | null }> {
    try {
      const { data, error } = await conversationMutations.updateConversationTitle(id, title);

      return {
        conversation: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async deleteConversation(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await conversationMutations.deleteConversation(id);

      return {
        success: !error,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async deleteConversationsByUser(userId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await conversationMutations.deleteConversationsByUser(userId);

      return {
        success: !error,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async deleteConversationsByBot(botId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await conversationMutations.deleteConversationsByBot(botId);

      return {
        success: !error,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async getConversationsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<{ conversations: ConversationRow[]; error: Error | null }> {
    try {
      const { data, error } = await conversationQueries.getConversationsByDateRange(startDate, endDate);

      return {
        conversations: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversations: [],
        error: error as Error,
      };
    }
  }

  async searchConversationsByTitle(
    userId: string,
    searchTerm: string,
    limit: number = 20
  ): Promise<{ conversations: ConversationRow[]; error: Error | null }> {
    try {
      const { data, error } = await conversationQueries.searchConversationsByTitle(userId, searchTerm, limit);

      return {
        conversations: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        conversations: [],
        error: error as Error,
      };
    }
  }
}

export const conversationService = new ConversationService();
