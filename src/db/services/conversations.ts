import { conversationsQueries, conversationsMutations } from "../api";
import { Database } from "../types";
import { conversationRowToModel, conversationModelToRow } from "../utils";
import { ErrorCode, DataBaseError } from "~utils/errors";
import { Sentry } from "~services/sentry";
import { MessageModel, ConversationModel } from "~types";
import { BotId } from "~app/bots";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

export class ConversationsService {
  async getConversationsByBotId(botId: string, userId: string): Promise<ConversationModel[]> {
    try {
      const { data, error } = await conversationsQueries.getConversationsByBotId(botId, userId);

      if (error) {
        throw new DataBaseError(
          `获取对话列表失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      return data ? data.map(conversationRowToModel) : [];
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `获取对话列表失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async getConversationById(id: string): Promise<ConversationModel> {
    try {
      const { data, error } = await conversationsQueries.getConversationById(id);

      if (error) {
        throw new DataBaseError(
          `获取对话失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '对话不存在',
          ErrorCode.DATABASE_RECORD_NOT_FOUND
        );
      }

      return conversationRowToModel(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `获取对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async createConversation(conversation: ConversationModel): Promise<ConversationModel> {
    try {
      const { data, error } = await conversationsMutations.insertConversation(conversationModelToRow(conversation));

      if (error) {
        throw new DataBaseError(
          `创建对话失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '创建对话失败: 未返回数据',
          ErrorCode.DATABASE_QUERY_FAILED
        );
      }

      return conversationRowToModel(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `创建对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async updateConversation(id: string, updates: Partial<ConversationModel>): Promise<ConversationModel> {
    try {
      const { data, error } = await conversationsMutations.updateConversation(id, conversationModelToRow(updates));

      if (error) {
        throw new DataBaseError(
          `更新对话失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '更新对话失败: 未返回数据',
          ErrorCode.DATABASE_QUERY_FAILED
        );
      }

      return conversationRowToModel(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `更新对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async updateConversationTitle(id: string, title: string): Promise<ConversationModel> {
    return this.updateConversation(id, { title });
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const { error } = await conversationsMutations.deleteConversation(id);

      if (error) {
        throw new DataBaseError(
          `删除对话失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `删除对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async deleteConversationsByBotId(botId: string, userId: string): Promise<void> {
    try {
      const { error } = await conversationsMutations.deleteConversationsByBotId(botId, userId);

      if (error) {
        throw new DataBaseError(
          `删除机器人对话失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `删除机器人对话失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }
}

export const conversationsService = new ConversationsService();
