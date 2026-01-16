import { messagesQueries, messagesMutations } from "../api";
import { Database } from "../types";
import { messageRowToModel, messageModelToRow } from "../utils";
import { MessageModel } from "~types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export class MessagesService {
  async getMessagesByConversationId(conversationId: string): Promise<MessageModel[] | null> {
    const { data } = await messagesQueries.getMessagesByConversationId(conversationId);
    return data ? data.map(messageRowToModel) : null;
  }

  async getMessageById(id: string): Promise<MessageModel | null> {
    const { data } = await messagesQueries.getMessageById(id);
    return data ? messageRowToModel(data) : null;
  }

  async createMessage(message: MessageModel): Promise<MessageModel | null> {
    const { data } = await messagesMutations.insertMessage(messageModelToRow(message));
    return data ? messageRowToModel(data) : null;
  }

  async createMessages(messages: MessageModel[]): Promise<MessageModel[] | null> {
    const { data } = await messagesMutations.insertMessages(messages.map((m) => messageModelToRow(m)));
    return data ? data.map(messageRowToModel) : null;
  }

  async updateMessage(id: string, updates: Partial<MessageModel>): Promise<MessageModel | null> {
    const { data } = await messagesMutations.updateMessage(id, messageModelToRow(updates));
    return data ? messageRowToModel(data) : null;
  }

  async deleteMessage(id: string): Promise<void> {
    await messagesMutations.deleteMessage(id);
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    await messagesMutations.deleteMessagesByConversationId(conversationId);
  }
}

export const messagesService = new MessagesService();
