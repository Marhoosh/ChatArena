import { conversationsQueries, conversationsMutations } from "../api";
import { Database } from "../types";
import { toCamelCaseObject, toSnakeCaseObject } from "../utils";
import { handleDatabaseError } from "../utils/helpers";
import { MessageModel } from "~types";
import { Message } from "./messages";
import { BotId } from "~app/bots";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

export interface Conversation {
  id: string;
  botId: string;
  userId: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export class ConversationsService {
  async getConversationsByBotId(botId: string, userId: string): Promise<{ conversations: Conversation[] | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsQueries.getConversationsByBotId(botId, userId);

      return {
        conversations: data ? data.map((item) => toCamelCaseObject<Conversation>(item)) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversations: null,
        error: error as Error,
      };
    }
  }

  async getConversationById(id: string): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsQueries.getConversationById(id);

      return {
        conversation: data ? toCamelCaseObject<Conversation>(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async createConversation(conversation: Conversation): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsMutations.insertConversation(toSnakeCaseObject(conversation));

      return {
        conversation: data ? toCamelCaseObject<Conversation>(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsMutations.updateConversation(id, toSnakeCaseObject(updates));

      return {
        conversation: data ? toCamelCaseObject<Conversation>(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async updateConversationTitle(id: string, title: string): Promise<{ conversation: Conversation | null; error: Error | null }> {
    return this.updateConversation(id, { title });
  }

  async deleteConversation(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await conversationsMutations.deleteConversation(id);

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

  async deleteConversationsByBotId(botId: string, userId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await conversationsMutations.deleteConversationsByBotId(botId, userId);

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

export const conversationsService = new ConversationsService();

// Conversion functions between database Message and application MessageModel
export function messageToModel(message: Message): MessageModel {
  return {
    id: message.id,
    author: message.author as BotId | 'user',
    text: message.text,
  };
}

export function modelToMessage(model: MessageModel, conversationId: string): Message {
  return {
    id: model.id,
    conversationId,
    author: model.author,
    text: model.text,
    imageUrl: null,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
