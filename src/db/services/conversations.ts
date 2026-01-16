import { conversationsQueries, conversationsMutations } from "../api";
import { conversationRowToModel, conversationModelToRow } from "../utils";
import {  ConversationModel } from "~types";


export class ConversationsService {
  async getConversationsByBotId(botId: string, userId: string): Promise<ConversationModel[] | null> {
    const { data } = await conversationsQueries.getConversationsByBotId(botId, userId);
    return data ? data.map(conversationRowToModel) : null;
  }

  async getConversationById(id: string): Promise<ConversationModel | null> {
    const { data } = await conversationsQueries.getConversationById(id);
    return data ? conversationRowToModel(data) : null;
  }

  async createConversation(conversation: ConversationModel): Promise<ConversationModel | null> {
    const { data } = await conversationsMutations.insertConversation(conversationModelToRow(conversation));
    return data ? conversationRowToModel(data) : null;
  }

  async updateConversation(id: string, updates: Partial<ConversationModel>): Promise<ConversationModel | null> {
    const { data } = await conversationsMutations.updateConversation(id, conversationModelToRow(updates));
    return data ? conversationRowToModel(data) : null;
  } 

  async updateConversationTitle(id: string, title: string): Promise<ConversationModel | null> {
    return this.updateConversation(id, { title });
  }

  async deleteConversation(id: string): Promise<void> {
    await conversationsMutations.deleteConversation(id);
  }

  async deleteConversationsByBotId(botId: string, userId: string): Promise<void> {
    await conversationsMutations.deleteConversationsByBotId(botId, userId);
  }
}

export const conversationsService = new ConversationsService();
