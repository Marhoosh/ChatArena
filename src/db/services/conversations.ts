import { conversationsQueries, conversationsMutations } from "../api";
import { Database } from "../types";
import { conversationRowToModel, conversationModelToRow } from "../utils";
import { ErrorCode, DataBaseError } from "~utils/errors";
import { MessageModel, ConversationModel } from "~types";
import { BotId } from "~app/bots";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

export class ConversationsService {
  async getConversationsByBotId(botId: string, userId: string): Promise<ConversationModel[] | null> {
    try {
      const { data } = await conversationsQueries.getConversationsByBotId(botId, userId);
      return data ? data.map(conversationRowToModel) : null;
    } catch (error) {
      throw new DataBaseError(
        `获取对话列表失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async getConversationById(id: string): Promise<ConversationModel | null> {
    try {
      const { data } = await conversationsQueries.getConversationById(id);

      return data ? conversationRowToModel(data) : null;

    } catch (error) {
      throw new DataBaseError(
        `获取对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async createConversation(conversation: ConversationModel): Promise<ConversationModel | null> {
    try {
      const { data } = await conversationsMutations.insertConversation(conversationModelToRow(conversation));

      return data ? conversationRowToModel(data) : null;
    } catch (error) {
      throw new DataBaseError(
        `创建对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async updateConversation(id: string, updates: Partial<ConversationModel>): Promise<ConversationModel | null> {
    try {
      const { data } = await conversationsMutations.updateConversation(id, conversationModelToRow(updates));

      return data ? conversationRowToModel(data) : null;
    } catch (error) {
      throw new DataBaseError(
        `更新对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  } 

  async updateConversationTitle(id: string, title: string): Promise<ConversationModel | null> {
    return this.updateConversation(id, { title });
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await conversationsMutations.deleteConversation(id);
    } catch (error) {
      throw new DataBaseError(
        `删除对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async deleteConversationsByBotId(botId: string, userId: string): Promise<void> {
    try {
      await conversationsMutations.deleteConversationsByBotId(botId, userId);
    } catch (error) {
      throw new DataBaseError(
        `删除机器人对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }
}

export const conversationsService = new ConversationsService();
