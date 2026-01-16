import { messagesQueries, messagesMutations } from "../api";
import { Database } from "../types";
import { messageRowToModel, messageModelToRow } from "../utils";
import { ErrorCode, DataBaseError } from "~utils/errors";
import { MessageModel } from "~types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export class MessagesService {
  async getMessagesByConversationId(conversationId: string): Promise<MessageModel[] | null> {
    try {
      const { data } = await messagesQueries.getMessagesByConversationId(conversationId);
      return data ? data.map(messageRowToModel) : null;
    } catch (error) {
      throw new DataBaseError(
        `获取对话消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async getMessageById(id: string): Promise<MessageModel | null> {
    try {
      const { data } = await messagesQueries.getMessageById(id);
      return data ? messageRowToModel(data) : null;
    } catch (error) {
      throw new DataBaseError(
        `获取消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async createMessage(message: MessageModel): Promise<MessageModel | null> {
    try {
      const { data } = await messagesMutations.insertMessage(messageModelToRow(message));
      return data ? messageRowToModel(data) : null;
    } catch (error) {
      throw new DataBaseError(
        `创建消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async createMessages(messages: MessageModel[]): Promise<MessageModel[] | null> {
    try {
      const { data } = await messagesMutations.insertMessages(messages.map((m) => messageModelToRow(m)));
      return data ? data.map(messageRowToModel) : null;
    } catch (error) {
      throw new DataBaseError(
        `批量创建消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async updateMessage(id: string, updates: Partial<MessageModel>): Promise<MessageModel | null> {
    try {
      const { data } = await messagesMutations.updateMessage(id, messageModelToRow(updates));
      return data ? messageRowToModel(data) : null;
    } catch (error) {
      throw new DataBaseError(
        `更新消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      await messagesMutations.deleteMessage(id);
    } catch (error) {
      throw new DataBaseError(
        `删除消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    try {
      await messagesMutations.deleteMessagesByConversationId(conversationId);
    } catch (error) {
      throw new DataBaseError(
        `删除对话消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }
}

export const messagesService = new MessagesService();
