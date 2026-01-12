import { BotId } from '~app/bots'
import { MessageModel, ConversationModel } from '~types'
import { conversationsService, messagesService } from '~db/services'
import { getCurrentUserOrThrow } from '~db/utils/helpers'
import { messageModelToRow } from '~db/utils/converters'

async function loadHistoryConversations(botId: BotId): Promise<ConversationModel[]> {
  const userId = await getCurrentUserOrThrow()
  const { conversations, error } = await conversationsService.getConversationsByBotId(botId, userId)
  if (error) {
    throw error
  }
  return conversations || []
}

async function deleteHistoryConversation(cid: string) {
  const userId = await getCurrentUserOrThrow()
  await messagesService.deleteMessagesByConversationId(cid)
  await conversationsService.deleteConversation(cid)
}

async function loadConversationMessages(botId: BotId, cid: string): Promise<MessageModel[]> {
  const { messages, error } = await messagesService.getMessagesByConversationId(cid)
  if (error) {
    throw error
  }
  return messages || []
}

export async function setConversationMessages(botId: BotId, cid: string, messages: MessageModel[]) {
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
    await messagesService.createMessages(newMessages.map((m) => ({ ...m, conversationId: cid })))
  }
}

export async function loadHistoryMessages(botId: BotId): Promise<ConversationModel[]> {
  const conversations = await loadHistoryConversations(botId)
  const results: ConversationModel[] = []

  for (const conversation of conversations) {
    const messages = await loadConversationMessages(botId, conversation.id)
    results.push({
      id: conversation.id,
      botId: conversation.botId,
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages,
    })
  }

  return results
}

export async function deleteHistoryMessage(botId: BotId, conversationId: string, messageId: string) {
  await messagesService.deleteMessage(messageId)
  const { messages } = await messagesService.getMessagesByConversationId(conversationId)
  if (!messages || messages.length === 0) {
    await deleteHistoryConversation(conversationId)
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
