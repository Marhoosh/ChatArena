import { messageQueries, messageMutations } from "../api";
import { Database } from "../types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export class MessageService {
  async getMessageById(id: string): Promise<{ message: MessageRow | null; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.getMessageById(id);

      return {
        message: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async getMessagesByConversationId(conversationId: string, limit: number = 100): Promise<{ messages: MessageRow[]; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.getMessagesByConversationId(conversationId, limit);

      return {
        messages: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        messages: [],
        error: error as Error,
      };
    }
  }

  async getMessagesByAuthor(conversationId: string, author: string, limit: number = 100): Promise<{ messages: MessageRow[]; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.getMessagesByAuthor(conversationId, author, limit);

      return {
        messages: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        messages: [],
        error: error as Error,
      };
    }
  }

  async getMessagesWithImages(conversationId: string, limit: number = 100): Promise<{ messages: MessageRow[]; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.getMessagesWithImages(conversationId, limit);

      return {
        messages: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        messages: [],
        error: error as Error,
      };
    }
  }

  async getMessagesWithErrors(conversationId: string, limit: number = 100): Promise<{ messages: MessageRow[]; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.getMessagesWithErrors(conversationId, limit);

      return {
        messages: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        messages: [],
        error: error as Error,
      };
    }
  }

  async getMessagesByDateRange(
    conversationId: string,
    startDate: string,
    endDate: string
  ): Promise<{ messages: MessageRow[]; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.getMessagesByDateRange(conversationId, startDate, endDate);

      return {
        messages: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        messages: [],
        error: error as Error,
      };
    }
  }

  async searchMessagesByText(
    conversationId: string,
    searchTerm: string,
    limit: number = 100
  ): Promise<{ messages: MessageRow[]; error: Error | null }> {
    try {
      const { data, error } = await messageQueries.searchMessagesByText(conversationId, searchTerm, limit);

      return {
        messages: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        messages: [],
        error: error as Error,
      };
    }
  }

  async getConversationMessageCount(conversationId: string): Promise<{ count: number | null; error: Error | null }> {
    try {
      const { count, error } = await messageQueries.getConversationMessageCount(conversationId);

      return {
        count,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        count: null,
        error: error as Error,
      };
    }
  }

  async createMessage(
    conversationId: string,
    author: string,
    text: string,
    imageData?: string | null,
    imageType?: string | null
  ): Promise<{ message: MessageRow | null; error: Error | null }> {
    try {
      const { data, error } = await messageMutations.createMessage(conversationId, author, text, imageData, imageType);

      return {
        message: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async updateMessage(
    id: string,
    updates: Partial<Pick<MessageRow, "text" | "image_data" | "image_type" | "error_code" | "error_message">>
  ): Promise<{ message: MessageRow | null; error: Error | null }> {
    try {
      const { data, error } = await messageMutations.updateMessage(id, updates);

      return {
        message: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async updateMessageText(id: string, text: string): Promise<{ message: MessageRow | null; error: Error | null }> {
    try {
      const { data, error } = await messageMutations.updateMessageText(id, text);

      return {
        message: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async updateMessageError(
    id: string,
    errorCode: string | null,
    errorMessage: string | null
  ): Promise<{ message: MessageRow | null; error: Error | null }> {
    try {
      const { data, error } = await messageMutations.updateMessageError(id, errorCode, errorMessage);

      return {
        message: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async deleteMessage(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await messageMutations.deleteMessage(id);

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

  async deleteMessagesByConversation(conversationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await messageMutations.deleteMessagesByConversation(conversationId);

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

  async deleteMessagesByAuthor(conversationId: string, author: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await messageMutations.deleteMessagesByAuthor(conversationId, author);

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
}

export const messageService = new MessageService();
