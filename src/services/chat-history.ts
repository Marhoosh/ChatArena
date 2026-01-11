import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import { conversationsService, messagesService } from '~db/services'
import { getCurrentUserId } from '~db/utils/helpers'
import { Message, Conversation } from '~db/services'

interface ConversationWithMessages extends Conversation {
  messages: ChatMessageModel[]
}

async function getCurrentUserOrThrow(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  return userId
}

function convertToChatMessageModel(message: Message): ChatMessageModel {
  return {
    id: message.id,
    author: message.author as BotId | 'user',
    text: message.text,
  }
}

function convertToMessage(chatMessage: ChatMessageModel, conversationId: string): Message {
  return {
    id: chatMessage.id,
    conversationId,
    author: chatMessage.author,
    text: chatMessage.text,
    imageUrl: null,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

async function loadHistoryConversations(botId: BotId): Promise<Conversation[]> {
  const userId = await getCurrentUserOrThrow()
  const { conversations, error } = await conversationsService.getConversationsByBotId(botId, userId)
  if (error) {
    throw error
  }
  return conversations || []
}

async function deleteHistoryConversation(botId: BotId, cid: string) {
  const userId = await getCurrentUserOrThrow()
  await messagesService.deleteMessagesByConversationId(cid)
  await conversationsService.deleteConversation(cid)
}

async function loadConversationMessages(botId: BotId, cid: string): Promise<ChatMessageModel[]> {
  const { messages, error } = await messagesService.getMessagesByConversationId(cid)
  if (error) {
    throw error
  }
  return messages ? messages.map(convertToChatMessageModel) : []
}

export async function setConversationMessages(botId: BotId, cid: string, messages: ChatMessageModel[]) {
  const userId = await getCurrentUserOrThrow()
  const { conversations } = await conversationsService.getConversationsByBotId(botId, userId)
  const existingConversation = conversations?.find((c) => c.id === cid)

  if (!existingConversation) {
    await conversationsService.createConversation({
      id: cid,
      botId,
      userId,
      title: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } else {
    await conversationsService.updateConversation(cid, {
      updatedAt: new Date().toISOString(),
    })
  }

  const { messages: existingMessages } = await messagesService.getMessagesByConversationId(cid)
  const existingMessageIds = new Set(existingMessages?.map((m) => m.id) || [])

  const newMessages = messages.filter((m) => !existingMessageIds.has(m.id))
  if (newMessages.length > 0) {
    await messagesService.createMessages(newMessages.map((m) => convertToMessage(m, cid)))
  }
}

export async function loadHistoryMessages(botId: BotId): Promise<ConversationWithMessages[]> {
  const conversations = await loadHistoryConversations(botId)
  const results: ConversationWithMessages[] = []

  for (const conversation of conversations) {
    const messages = await loadConversationMessages(botId, conversation.id)
    results.push({
      ...conversation,
      messages,
    })
  }

  return results
}

export async function deleteHistoryMessage(botId: BotId, conversationId: string, messageId: string) {
  await messagesService.deleteMessage(messageId)
  const { messages } = await messagesService.getMessagesByConversationId(conversationId)
  if (!messages || messages.length === 0) {
    await deleteHistoryConversation(botId, conversationId)
  }
}

export async function clearHistoryMessages(botId: BotId) {
  const userId = await getCurrentUserOrThrow()
  const { conversations } = await conversationsService.getConversationsByBotId(botId, userId)
  if (conversations) {
    await Promise.all(
      conversations.map((c) => messagesService.deleteMessagesByConversationId(c.id))
    )
    await conversationsService.deleteConversationsByBotId(botId, userId)
  }
}
