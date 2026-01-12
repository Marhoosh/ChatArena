import { conversationsQueries, conversationsMutations } from "../api";
import { Database } from "../types";
import { conversationRowToModel, conversationModelToRow } from "../utils";
import { handleDatabaseError } from "../utils/helpers";
import { MessageModel, ConversationModel } from "~types";
import { MessageModel as DBMessage } from "./messages";
import { BotId } from "~app/bots";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

export class ConversationsService {
  async getConversationsByBotId(botId: string, userId: string): Promise<{ conversations: ConversationModel[] | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsQueries.getConversationsByBotId(botId, userId);

      return {
        conversations: data ? data.map(conversationRowToModel) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversations: null,
        error: error as Error,
      };
    }
  }

  async getConversationById(id: string): Promise<{ conversation: ConversationModel | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsQueries.getConversationById(id);

      return {
        conversation: data ? conversationRowToModel(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async createConversation(conversation: ConversationModel): Promise<{ conversation: ConversationModel | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsMutations.insertConversation(conversationModelToRow(conversation));

      return {
        conversation: data ? conversationRowToModel(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async updateConversation(id: string, updates: Partial<ConversationModel>): Promise<{ conversation: ConversationModel | null; error: Error | null }> {
    try {
      const { data, error } = await conversationsMutations.updateConversation(id, conversationModelToRow(updates));

      return {
        conversation: data ? conversationRowToModel(data) : null,
        error: error ? handleDatabaseError(error) : null,
      };
    } catch (error) {
      return {
        conversation: null,
        error: error as Error,
      };
    }
  }

  async updateConversationTitle(id: string, title: string): Promise<{ conversation: ConversationModel | null; error: Error | null }> {
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

// Conversion functions between database Message and application Message
export function messageToModel(message: DBMessage): MessageModel {
  return {
    id: message.id,
    author: message.author as BotId | 'user',
    text: message.text,
    imageUrl: message.imageUrl,
    conversationId: message.conversationId,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export function modelToMessage(model: MessageModel, conversationId: string): DBMessage {
  return {
    id: model.id,
    conversationId,
    author: model.author,
    text: model.text,
    imageUrl: model.imageUrl || null,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
