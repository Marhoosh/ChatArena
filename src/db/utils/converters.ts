import { Conversation, Message } from "~types";
import { ChatError } from "~utils/errors";
import { BotId } from "~app/bots";
import { Database } from "../types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

// Conversation conversion functions
export function conversationRowToModel(row: ConversationRow): Conversation {
  return {
    id: row.id,
    botId: row.bot_id,
    userId: row.user_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function conversationModelToRow(model: Partial<Conversation>): Omit<ConversationRow, 'created_at' | 'updated_at'> {
  return {
    id: model.id!,
    bot_id: model.botId!,
    user_id: model.userId,
    title: model.title,
  };
}

// Message conversion functions
export function messageRowToModel(row: MessageRow): Message {
  const result: Message = {
    id: row.id,
    author: row.author as BotId | 'user',
    text: row.text,
    imageUrl: row.image_url,
    conversationId: row.conversation_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Convert error fields to ChatError if they exist
  if (row.error_code || row.error_message) {
    result.error = {
      code: row.error_code as any,
      message: row.error_message || '',
    };
  }

  return result;
}

export function messageModelToRow(model: Partial<Message>, conversationId?: string): Omit<MessageRow, 'created_at' | 'updated_at'> {
  const result: Omit<MessageRow, 'created_at' | 'updated_at'> = {
    id: model.id!,
    author: model.author!,
    text: model.text!,
    conversation_id: conversationId || model.conversationId || '',
    image_url: model.imageUrl || null,
    error_code: null,
    error_message: null,
  };

  // Convert ChatError to error fields if it exists
  if (model.error) {
    result.error_code = model.error.code;
    result.error_message = model.error.message;
  }

  return result;
}

// Helper function to convert Message with image Blob to database format
export function messageWithImageToModel(model: Message): Message {
  // Create a copy of the model without the image Blob for database storage
  const { image, ...rest } = model;
  return {
    ...rest,
    imageUrl: null, // Will be set separately if image is uploaded
  };
}

// Helper function to convert database Message to Message with image Blob
export function messageToModelWithImage(model: Message, image?: Blob): Message {
  return {
    ...model,
    image,
  };
}