import { messagesQueries, messagesMutations } from "../api";
import { Database } from "../types";
import { messageRowToModel, messageModelToRow } from "../utils";
import { ErrorCode, DataBaseError } from "~utils/errors";
import { Sentry } from "~services/sentry";
import { MessageModel } from "~types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export class MessagesService {
  async getMessagesByConversationId(conversationId: string): Promise<MessageModel[]> {
    try {
      const { data, error } = await messagesQueries.getMessagesByConversationId(conversationId);

      if (error) {
        throw new DataBaseError(
          `获取对话消息失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      return data ? data.map(messageRowToModel) : [];
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `获取对话消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async getMessageById(id: string): Promise<MessageModel> {
    try {
      const { data, error } = await messagesQueries.getMessageById(id);

      if (error) {
        throw new DataBaseError(
          `获取消息失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '消息不存在',
          ErrorCode.DATABASE_RECORD_NOT_FOUND
        );
      }

      return messageRowToModel(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `获取消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async createMessage(message: MessageModel): Promise<MessageModel> {
    try {
      const { data, error } = await messagesMutations.insertMessage(messageModelToRow(message));

      if (error) {
        throw new DataBaseError(
          `创建消息失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '创建消息失败: 未返回数据',
          ErrorCode.DATABASE_QUERY_FAILED
        );
      }

      return messageRowToModel(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `创建消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async createMessages(messages: MessageModel[]): Promise<MessageModel[]> {
    try {
      const { data, error } = await messagesMutations.insertMessages(messages.map((m) => messageModelToRow(m)));

      if (error) {
        throw new DataBaseError(
          `批量创建消息失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '批量创建消息失败: 未返回数据',
          ErrorCode.DATABASE_QUERY_FAILED
        );
      }

      return data.map(messageRowToModel);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `批量创建消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async updateMessage(id: string, updates: Partial<MessageModel>): Promise<MessageModel> {
    try {
      const { data, error } = await messagesMutations.updateMessage(id, messageModelToRow(updates));

      if (error) {
        throw new DataBaseError(
          `更新消息失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '更新消息失败: 未返回数据',
          ErrorCode.DATABASE_QUERY_FAILED
        );
      }

      return messageRowToModel(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `更新消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      const { error } = await messagesMutations.deleteMessage(id);

      if (error) {
        throw new DataBaseError(
          `删除消息失败: ${error.message || '未知错误'}`,
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
        `删除消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    try {
      const { error } = await messagesMutations.deleteMessagesByConversationId(conversationId);

      if (error) {
        throw new DataBaseError(
          `删除对话消息失败: ${error.message || '未知错误'}`,
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
        `删除对话消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }
}

export const messagesService = new MessagesService();
