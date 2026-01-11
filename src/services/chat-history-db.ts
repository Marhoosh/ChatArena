import { zip } from 'lodash-es'
import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import { ChatError } from '~utils/errors'
import { conversationQueries, conversationMutations, messageQueries, messageMutations } from '~db/api'
import { getCurrentUserId } from '~db/utils/helpers'

interface Conversation {
  id: string
  createdAt: number
}

type ConversationWithMessages = Conversation & { messages: ChatMessageModel[] }

async function getUserId(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  return userId
}

function dbMessageToChatMessage(dbMessage: any): ChatMessageModel {
  const chatMessage: ChatMessageModel = {
    id: dbMessage.id,
    author: dbMessage.author as BotId | 'user',
    text: dbMessage.text,
  }

  if (dbMessage.error_code || dbMessage.error_message) {
    chatMessage.error = new ChatError(
      dbMessage.error_message || 'Unknown error',
      dbMessage.error_code || 'UNKOWN_ERROR' as any
    )
  }

  if (dbMessage.image_url) {
    chatMessage.image = dbMessage.image_url as any
  }

  return chatMessage
}

function chatMessageToDbMessage(chatMessage: ChatMessageModel, conversationId: string): any {
  const dbMessage: any = {
    id: chatMessage.id,
    conversation_id: conversationId,
    author: chatMessage.author,
    text: chatMessage.text,
  }

  if (chatMessage.error) {
    dbMessage.error_code = chatMessage.error.code
    dbMessage.error_message = chatMessage.error.message
  }

  if (chatMessage.image) {
    dbMessage.image_url = chatMessage.image as string
  }

  return dbMessage
}

function dbConversationToConversation(dbConversation: any): Conversation {
  return {
    id: dbConversation.id,
    createdAt: new Date(dbConversation.created_at).getTime(),
  }
}

async function loadHistoryConversations(botId: BotId): Promise<Conversation[]> {
  const userId = await getUserId()
  const { data, error } = await conversationQueries.getConversationsByBotId(botId, userId)
  
  if (error) {
    console.error('Failed to load conversations:', error)
    return []
  }

  return (data || []).map(dbConversationToConversation)
}

async function deleteHistoryConversation(botId: BotId, cid: string) {
  const { error } = await conversationMutations.deleteConversation(cid)
  if (error) {
    console.error('Failed to delete conversation:', error)
  }
}

async function loadConversationMessages(botId: BotId, cid: string): Promise<ChatMessageModel[]> {
  const { data, error } = await messageQueries.getMessagesByConversationId(cid)
  
  if (error) {
    console.error('Failed to load messages:', error)
    return []
  }

  return (data || []).map(dbMessageToChatMessage)
}

export async function setConversationMessages(botId: BotId, cid: string, messages: ChatMessageModel[]) {
  const userId = await getUserId()
  
  const { data: existingConversation } = await conversationQueries.getConversationById(cid)
  
  if (!existingConversation) {
    await conversationMutations.createConversation({
      id: cid,
      bot_id: botId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  for (const message of messages) {
    const dbMessage = chatMessageToDbMessage(message, cid)
    await messageMutations.createMessage(dbMessage)
  }
}

export async function loadHistoryMessages(botId: BotId): Promise<ConversationWithMessages[]> {
  const conversations = await loadHistoryConversations(botId)
  const messagesList = await Promise.all(conversations.map((c) => loadConversationMessages(botId, c.id)))
  return zip(conversations, messagesList).map(([c, messages]) => ({
    id: c!.id,
    createdAt: c!.createdAt,
    messages: messages!,
  }))
}

export async function deleteHistoryMessage(botId: BotId, conversationId: string, messageId: string) {
  const { error } = await messageMutations.deleteMessage(messageId)
  if (error) {
    console.error('Failed to delete message:', error)
    return
  }

  const { data: remainingMessages } = await messageQueries.getMessagesByConversationId(conversationId)
  if (!remainingMessages || remainingMessages.length === 0) {
    await deleteHistoryConversation(botId, conversationId)
  }
}

export async function clearHistoryMessages(botId: BotId) {
  const conversations = await loadHistoryConversations(botId)
  await Promise.all(
    conversations.map((c) => messageMutations.deleteMessagesByConversationId(c.id))
  )
  await Promise.all(
    conversations.map((c) => conversationMutations.deleteConversation(c.id))
  )
}
