import { messagesQueries, messagesMutations } from "../api";
import { Database } from "../types";
import { toCamelCaseObject, toSnakeCaseObject } from "../utils";
import { handleDatabaseError } from "../utils/helpers";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export interface Message {
  id: string;
  conversationId: string;
  author: string;
  text: string;
  imageUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export class MessagesService {
  async getMessagesByConversationId(conversationId: string): Promise<{ messages: Message[] | null; error: Error | null }> {
    try {
      const { data, error } = await messagesQueries.getMessagesByConversationId(conversationId);

      return {
        messages: data ? data.map((item) => toCamelCaseObject<Message>(item)) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        messages: null,
        error: error as Error,
      };
    }
  }

  async getMessageById(id: string): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await messagesQueries.getMessageById(id);

      return {
        message: data ? toCamelCaseObject<Message>(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async createMessage(message: Message): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await messagesMutations.insertMessage(toSnakeCaseObject(message));

      return {
        message: data ? toCamelCaseObject<Message>(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        message: null,
        error: error as Error,
      };
    }
  }

  async createMessages(messages: Message[]): Promise<{ messages: Message[] | null; error: Error | null }> {
    try {
      const { data, error } = await messagesMutations.insertMessages(messages.map((m) => toSnakeCaseObject(m)));

      return {
        messages: data ? data.map((item) => toCamelCaseObject<Message>(item)) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        messages: null,
        error: error as Error,
      };
    }
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await messagesMutations.updateMessage(id, toSnakeCaseObject(updates));

      return {
        message: data ? toCamelCaseObject<Message>(data) : null,
        error: error ? handleDatabaseError(error) : null,
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
      const { error } = await messagesMutations.deleteMessage(id);

      return {
        success: !error,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await messagesMutations.deleteMessagesByConversationId(conversationId);

      return {
        success: !error,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
}

export const messagesService = new MessagesService();
