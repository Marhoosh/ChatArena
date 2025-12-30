import { chatQueries, chatMutations } from "../api";
import { Conversation, Message } from "../types";

export class ChatService {
  async getConversations(userId: string): Promise<{ conversations: Conversation[]; error: Error | null }> {
    try {
      const { data, error } = await chatQueries.getConversations(userId);

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

  async getConversation(id: string): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await chatQueries.getConversation(id);

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

  async createConversation(
    userId: string,
    title: string,
    botType: string
  ): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await chatMutations.createConversation(userId, title, botType);

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
    updates: Partial<Pick<Conversation, "title" | "bot_type">>
  ): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await chatMutations.updateConversation(id, updates);

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

  async deleteConversation(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await chatMutations.deleteConversation(id);
      return {
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        error: error as Error,
      };
    }
  }

  async getMessages(conversationId: string): Promise<{ messages: Message[]; error: Error | null }> {
    try {
      const { data, error } = await chatQueries.getMessages(conversationId);

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

  async createMessage(
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string
  ): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await chatMutations.createMessage(conversationId, role, content);

      if (data && !error) {
        await this.updateConversation(conversationId, {});
      }

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
    content: string
  ): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await chatMutations.updateMessage(id, content);

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

  async deleteMessage(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await chatMutations.deleteMessage(id);
      return {
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        error: error as Error,
      };
    }
  }
}

export const chatService = new ChatService();