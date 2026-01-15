import { BotId } from '~app/bots'
import { MessageModel, ConversationModel } from '~types'
import { conversationsService, messagesService } from '~db/services'
import { getCurrentUserOrThrow } from '~db/utils/helpers'
import { messageModelToRow } from '~db/utils/converters'
import { Sentry } from '~services/sentry'

async function loadHistoryConversations(botId: BotId): Promise<ConversationModel[]> {
  try {
    const userId = await getCurrentUserOrThrow()
    return await conversationsService.getConversationsByBotId(botId, userId)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

async function deleteHistoryConversation(cid: string) {
  try {
    await messagesService.deleteMessagesByConversationId(cid)
    await conversationsService.deleteConversation(cid)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

async function loadConversationMessages(botId: BotId, cid: string): Promise<MessageModel[]> {
  try {
    return await messagesService.getMessagesByConversationId(cid)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function setConversationMessages(botId: BotId, cid: string, messages: MessageModel[]) {
  try {
    const userId = await getCurrentUserOrThrow()
    const conversations = await conversationsService.getConversationsByBotId(botId, userId)
    const existingConversation = conversations.find((c) => c.id === cid)

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

    const existingMessages = await messagesService.getMessagesByConversationId(cid)
    const existingMessageIds = new Set(existingMessages.map((m) => m.id))

    const newMessages = messages.filter((m) => !existingMessageIds.has(m.id))
    if (newMessages.length > 0) {
      await messagesService.createMessages(newMessages.map((m) => ({ ...m, conversationId: cid })))
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function loadHistoryMessages(botId: BotId): Promise<ConversationModel[]> {
  try {
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
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function deleteHistoryMessage(botId: BotId, conversationId: string, messageId: string) {
  try {
    await messagesService.deleteMessage(messageId)
    const messages = await messagesService.getMessagesByConversationId(conversationId)
    if (messages.length === 0) {
      await deleteHistoryConversation(conversationId)
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function clearHistoryMessages(botId: BotId) {
  try {
    const userId = await getCurrentUserOrThrow()
    const conversations = await conversationsService.getConversationsByBotId(botId, userId)
    if (conversations.length > 0) {
      await Promise.all(
        conversations.map((c) => messagesService.deleteMessagesByConversationId(c.id))
      )
      await conversationsService.deleteConversationsByBotId(botId, userId)
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
